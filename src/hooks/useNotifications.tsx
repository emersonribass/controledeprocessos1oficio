
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification } from "@/types";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useNotificationsService } from "./useNotificationsService";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  refreshNotifications: () => Promise<void>;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const { fetchUserNotifications, markNotificationAsRead } = useNotificationsService();

  const loadNotifications = async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    setLoading(true);
    try {
      const userNotifications = await fetchUserNotifications(user.id);
      setNotifications(userNotifications);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar notificações quando o usuário for autenticado
  useEffect(() => {
    loadNotifications();
    
    // Configurar a assinatura em tempo real para novas notificações
    if (user) {
      const channel = supabase
        .channel('public:notificacoes')
        .on('postgres_changes', 
          {
            event: 'INSERT',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`
          }, 
          (payload) => {
            // Quando uma nova notificação é recebida
            const newNotification: Notification = {
              id: payload.new.id,
              userId: payload.new.usuario_id,
              processId: payload.new.processo_id,
              message: payload.new.mensagem,
              read: payload.new.lida || false,
              createdAt: payload.new.created_at,
              type: payload.new.tipo || 'movimento',
              responded: payload.new.respondida || false
            };
            
            setNotifications(prev => [newNotification, ...prev]);
            
            // Mostrar um toast para a nova notificação
            toast({
              title: "Nova notificação",
              description: payload.new.mensagem,
            });
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [user]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = async (id: string) => {
    const success = await markNotificationAsRead(id);
    if (success) {
      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === id
            ? { ...notification, read: true }
            : notification
        )
      );
    }
  };

  const markAllAsRead = async () => {
    // Filtrar apenas notificações não lidas
    const unreadNotifications = notifications.filter(n => !n.read);
    
    // Se não houver notificações não lidas, não fazer nada
    if (unreadNotifications.length === 0) return;
    
    try {
      // Marcar todas as notificações como lidas no banco de dados
      const promises = unreadNotifications.map(notification => 
        markNotificationAsRead(notification.id)
      );
      
      await Promise.all(promises);
      
      // Atualizar o estado local
      setNotifications((prev) =>
        prev.map((notification) => ({ ...notification, read: true }))
      );
      
      toast({
        title: "Sucesso",
        description: "Todas as notificações foram marcadas como lidas"
      });
    } catch (error) {
      console.error("Erro ao marcar todas as notificações como lidas:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar todas as notificações como lidas",
        variant: "destructive"
      });
    }
  };

  const refreshNotifications = async () => {
    await loadNotifications();
  };

  return (
    <NotificationsContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead, 
        refreshNotifications 
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
