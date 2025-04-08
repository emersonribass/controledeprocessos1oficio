import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Notification } from "@/types";
import { mockNotifications } from "@/lib/mockData";
import { useAuth } from "@/hooks/auth";

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

  useEffect(() => {
    if (user) {
      // In a real application, you would fetch notifications from the API
      // Filter notifications for the current user
      const userNotifications = mockNotifications.filter(
        (notification) => notification.userId === user.id
      );
      setNotifications(userNotifications);
    } else {
      setNotifications([]);
    }
  }, [user]);

  const unreadCount = notifications.filter((notification) => !notification.read).length;

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((notification) =>
        notification.id === id
          ? { ...notification, read: true }
          : notification
      )
    );
  };

  const markAllAsRead = () => {
    setNotifications((prev) =>
      prev.map((notification) => ({ ...notification, read: true }))
    );
  };

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
    throw new Error("useNotifications must be used within a NotificationsProvider");
  }
  return context;
};
