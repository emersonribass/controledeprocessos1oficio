
export interface Notification {
  id: string;
  userId: string;
  processId: string;
  message: string;
  read: boolean;
  createdAt: string;
  respondida: boolean;
  tipo?: string;
}

export interface NotificationServiceHookResult {
  markAsRead: (notificationId: string) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
  createNotification: (notification: Omit<Notification, 'id' | 'createdAt' | 'read'>) => Promise<boolean>;
}

export interface NotificationsHookResult {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  refetchNotifications: () => Promise<void>;
  markAsRead: (notificationId: string) => Promise<boolean>;
  deleteNotification: (notificationId: string) => Promise<boolean>;
}
