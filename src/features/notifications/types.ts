
export interface Notification {
  id: string;
  userId: string;
  processId: string;
  message: string;
  read: boolean;
  createdAt: string;
  respondida: boolean;
}
