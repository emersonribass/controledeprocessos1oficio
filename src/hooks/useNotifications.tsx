
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

type Notification = {
  id: string;
  usuario_id: string;
  processo_id: string | null;
  message: string;
  tipo: string;
  data_criacao: string;
  lida: boolean;
  respondida: boolean;
};

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const { user } = useAuth();

  // Carregar notificações do usuário
  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([]);
      setUnreadCount(0);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('data_criacao', { ascending: false });

      if (error) throw error;

      if (data) {
        setNotifications(data);
        setUnreadCount(data.filter(n => !n.lida).length);
      }
    } catch (error) {
      console.error('Erro ao carregar notificações:', error);
    }
  };

  // Marcar notificação como lida
  const markAsRead = async (id: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', id);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.map(notification => 
        notification.id === id ? { ...notification, lida: true } : notification
      ));
      
      // Recalcular contagem de não lidas
      setUnreadCount(prev => Math.max(0, prev - 1));

      // Se for uma notificação de processo, navegar para a página do processo
      const notification = notifications.find(n => n.id === id);
      if (notification?.processo_id && notification.tipo === 'processo_movido') {
        window.location.href = `/processes/${notification.processo_id}`;
      }
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
    }
  };

  // Marcar todas as notificações como lidas
  const markAllAsRead = async () => {
    if (!user || notifications.length === 0) return;

    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', user.id)
        .eq('lida', false);

      if (error) throw error;

      // Atualizar estado local
      setNotifications(prev => prev.map(notification => ({ ...notification, lida: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
    }
  };

  // Carregar notificações iniciais
  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  // Configurar canal de tempo real para novas notificações
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notificacoes',
        filter: `usuario_id=eq.${user.id}`
      }, payload => {
        // Adicionar nova notificação ao estado
        const newNotification = payload.new as Notification;
        setNotifications(prev => [newNotification, ...prev]);
        setUnreadCount(prev => prev + 1);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const refreshNotifications = async () => {
    await fetchNotifications();
  };

  return (
    <NotificationsContext.Provider value={{ 
      notifications, 
      unreadCount, 
      markAsRead, 
      markAllAsRead,
      refreshNotifications 
    }}>
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
};
