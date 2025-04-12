import { useState, useEffect } from "react";
import { useNotificationsService } from "@/hooks/useNotificationsService";
import { Notification } from "@/types";
import { useAuth } from "@/features/auth";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const { fetchNotifications, markAsRead, markAllAsRead } = useNotificationsService();
  const { user } = useAuth();

  const loadNotifications = async () => {
    setIsLoading(true);
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      setUnreadCount(data.filter(n => !n.read).length);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadNotifications();
      
      // Atualizar notificações a cada 5 minutos
      const interval = setInterval(loadNotifications, 5 * 60 * 1000);
      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    // Atualização otimista
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));

    const success = await markAsRead(id);
    if (!success) {
      // Reverter se falhar
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: false } : n)
      );
      setUnreadCount(prev => prev + 1);
    }
    
    return success;
  };

  const handleMarkAllAsRead = async () => {
    // Atualização otimista
    const unreadNotificationsCount = notifications.filter(n => !n.read).length;
    setNotifications(prev => 
      prev.map(n => ({ ...n, read: true }))
    );
    setUnreadCount(0);

    const success = await markAllAsRead();
    if (!success) {
      // Reverter se falhar
      setNotifications(prev => 
        prev.map(n => n === n ? { ...n, read: false } : n)
      );
      setUnreadCount(unreadNotificationsCount);
    }
    
    return success;
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    refresh: loadNotifications,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead
  };
};
