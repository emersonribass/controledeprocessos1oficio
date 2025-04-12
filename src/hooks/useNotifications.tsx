
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useNotificationsService } from "@/hooks/useNotificationsService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { 
    fetchUserNotifications, 
    markNotificationAsRead,
    isLoading 
  } = useNotificationsService();

  // Função para buscar notificações do usuário atual
  const loadNotifications = async () => {
    if (user && user.id) {
      try {
        const userNotifications = await fetchUserNotifications(user.id);
        setNotifications(userNotifications);
      } catch (error) {
        console.error("Erro ao carregar notificações:", error);
      }
    }
  };

  // Carregar notificações quando o usuário estiver autenticado
  useEffect(() => {
    if (user) {
      loadNotifications();

      // Configurar canal de tempo real para atualizações de notificações
      const channel = supabase
        .channel('notificacoes-changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notificacoes',
            filter: `usuario_id=eq.${user.id}`
          },
          () => {
            // Recarregar notificações quando houver mudanças
            loadNotifications();
          }
        )
        .subscribe();

      // Limpar inscrição ao desmontar
      return () => {
        supabase.removeChannel(channel);
      };
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = async (id: string) => {
    // Atualizar localmente para uma resposta imediata da UI
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    // Atualizar no banco de dados
    if (user) {
      try {
        const success = await markNotificationAsRead(id);
        if (!success) {
          // Reverter alteração local em caso de erro
          await loadNotifications();
        }
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        // Reverter alteração local em caso de erro
        await loadNotifications();
      }
    }
  };

  const markAllAsRead = async () => {
    // Atualizar localmente para uma resposta imediata da UI
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );

    // Atualizar todas as notificações no banco de dados
    if (user) {
      try {
        const unreadNotifications = notifications.filter(notification => !notification.read);
        
        if (unreadNotifications.length === 0) {
          return; // Nenhuma notificação não lida para atualizar
        }
        
        // Atualizar cada notificação não lida no banco de dados
        const promises = unreadNotifications.map(notification => 
          markNotificationAsRead(notification.id)
        );
        
        const results = await Promise.allSettled(promises);
        
        // Verificar se houve erros e mostrar toast apropriado
        const failures = results.filter(result => result.status === 'rejected').length;
        
        if (failures > 0) {
          console.error(`${failures} notificações não puderam ser marcadas como lidas`);
          toast({
            title: "Aviso",
            description: `${failures} notificações não puderam ser marcadas como lidas.`,
            variant: "destructive"
          });
          
          // Recarregar notificações para garantir sincronização
          await loadNotifications();
        } else if (unreadNotifications.length > 0) {
          toast({
            title: "Sucesso",
            description: "Todas as notificações foram marcadas como lidas.",
            variant: "default"
          });
        }
      } catch (error) {
        console.error("Erro ao marcar todas notificações como lidas:", error);
        toast({
          title: "Erro",
          description: "Não foi possível marcar todas as notificações como lidas.",
          variant: "destructive"
        });
        // Reverter alterações locais em caso de erro
        await loadNotifications();
      }
    }
  };

  return (
    <NotificationsContext.Provider
      value={{ 
        notifications, 
        unreadCount, 
        markAsRead, 
        markAllAsRead 
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
