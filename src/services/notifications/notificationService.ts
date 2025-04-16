
import { useNotifications } from "@/hooks/useNotifications";
import { useNotificationsService } from "@/hooks/useNotificationsService";
import { ToastService } from "@/services/toast/toastService";

/**
 * Serviço para gerenciar notificações da aplicação
 */
export class NotificationService {
  /**
   * Marca uma notificação como lida
   * @param notificationId ID da notificação
   */
  static async markAsRead(notificationId: string) {
    try {
      const { markNotificationAsRead } = useNotificationsService();
      const success = await markNotificationAsRead(notificationId);
      
      if (!success) {
        ToastService.error("Erro ao marcar notificação como lida");
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao marcar notificação como lida:", error);
      ToastService.error("Erro ao marcar notificação como lida");
      return false;
    }
  }

  /**
   * Cria uma nova notificação para um usuário
   * @param processId ID do processo
   * @param userId ID do usuário
   * @param message Mensagem da notificação
   * @param type Tipo da notificação
   */
  static async createNotification(
    processId: string,
    userId: string,
    message: string,
    type: string = "movimento"
  ) {
    try {
      const { createNotification } = useNotificationsService();
      const success = await createNotification(processId, userId, message, type);
      
      if (!success) {
        ToastService.error("Erro ao criar notificação");
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao criar notificação:", error);
      ToastService.error("Erro ao criar notificação");
      return false;
    }
  }

  /**
   * Notifica todos os usuários de um departamento
   * @param processId ID do processo
   * @param departmentId ID do departamento
   * @param message Mensagem da notificação
   * @param type Tipo da notificação
   */
  static async notifyDepartmentUsers(
    processId: string,
    departmentId: string,
    message: string,
    type: string = "movimento"
  ) {
    try {
      const { notifyDepartmentUsers } = useNotificationsService();
      const success = await notifyDepartmentUsers(
        processId,
        departmentId,
        message,
        type
      );
      
      if (!success) {
        ToastService.error("Erro ao notificar usuários do departamento");
      }
      
      return success;
    } catch (error) {
      console.error("Erro ao notificar usuários do departamento:", error);
      ToastService.error("Erro ao notificar usuários do departamento");
      return false;
    }
  }
}
