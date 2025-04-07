
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification } from "@/types";
import { mockNotifications } from "@/lib/mockData";
import { useAuth } from "./useAuth";
import { useNotificationsService } from "./useNotificationsService";

type NotificationsContextType = {
  notifications: Notification[];
  unreadCount: number;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
};

const NotificationsContext = createContext<NotificationsContextType | undefined>(undefined);

export const NotificationsProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { fetchUserNotifications, markNotificationAsRead } = useNotificationsService();

  useEffect(() => {
    // Função para carregar as notificações
    const loadNotifications = async () => {
      if (user) {
        try {
          // Tente buscar do serviço primeiro
          const userNotifications = await fetchUserNotifications(user.id);
          
          if (userNotifications.length > 0) {
            setNotifications(userNotifications);
          } else {
            // Usar mock como fallback
            const mockUserNotifications = mockNotifications.filter(
              (notification) => notification.userId === user.id
            );
            setNotifications(mockUserNotifications);
          }
        } catch (error) {
          console.error("Erro ao buscar notificações:", error);
          
          // Usar mock como fallback em caso de erro
          const mockUserNotifications = mockNotifications.filter(
            (notification) => notification.userId === user.id
          );
          setNotifications(mockUserNotifications);
        }
      } else {
        setNotifications([]);
      }
    };

    loadNotifications();
  }, [user, fetchUserNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = async (id: string) => {
    // Marcar no estado local primeiro para resposta imediata
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );

    // Se o usuário estiver logado, tenta atualizar no backend
    if (user) {
      try {
        await markNotificationAsRead(id);
      } catch (error) {
        console.error("Erro ao marcar notificação como lida:", error);
        // Não revertemos o estado local, pois queremos manter a experiência do usuário
      }
    }
  };

  const markAllAsRead = () => {
    // Atualiza todas localmente
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );

    // Se houver implementação no backend, poderia chamar um método para marcar todas como lidas
  };

  // Registrando explicitamente o provedor para debug
  console.log("NotificationsProvider sendo renderizado, usuário:", user?.id);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, markAsRead, markAllAsRead }}
    >
      {children}
    </NotificationsContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationsContext);
  
  // Adicionando melhor mensagem de erro para debug
  if (context === undefined) {
    console.error("useNotifications está sendo chamado fora de um NotificationsProvider");
    throw new Error("useNotifications deve ser usado dentro de um NotificationsProvider");
  }
  
  return context;
};
