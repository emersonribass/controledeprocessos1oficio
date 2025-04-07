
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";
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
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [loadedForUserId, setLoadedForUserId] = useState<string | null>(null);

  // Otimizando as funções com useCallback para evitar recriações desnecessárias
  const markAsRead = useCallback(async (id: string) => {
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
      }
    }
  }, [user, markNotificationAsRead]);

  const markAllAsRead = useCallback(() => {
    // Atualiza todas localmente
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
    
    // Implementação futura para backend
  }, []);

  // Usando um efeito com melhores dependências para carregar notificações apenas quando necessário
  useEffect(() => {
    // Evitar carregamento redundante se já carregou para este usuário
    if (!user || loadingNotifications || (loadedForUserId === user.id)) return;
    
    const loadNotifications = async () => {
      try {
        setLoadingNotifications(true);
        console.log("Carregando notificações para usuário:", user.id);
        
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
        
        // Registrar que já carregamos para este usuário
        setLoadedForUserId(user.id);
      } catch (error) {
        console.error("Erro ao buscar notificações:", error);
        
        // Usar mock como fallback em caso de erro
        const mockUserNotifications = mockNotifications.filter(
          (notification) => notification.userId === user.id
        );
        setNotifications(mockUserNotifications);
      } finally {
        setLoadingNotifications(false);
      }
    };

    loadNotifications();
  }, [user, fetchUserNotifications, loadedForUserId, loadingNotifications]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

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
  
  if (context === undefined) {
    console.error("useNotifications está sendo chamado fora de um NotificationsProvider");
    // Fornecer um contexto de fallback para evitar erros
    return {
      notifications: [],
      unreadCount: 0,
      markAsRead: () => {},
      markAllAsRead: () => {},
    };
  }
  
  return context;
};
