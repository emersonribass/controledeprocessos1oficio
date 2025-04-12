
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/features/auth";
import { Notification } from "@/types";

export const useNotificationsService = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchNotifications = async (): Promise<Notification[]> => {
    try {
      if (!user) return [];

      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Mapeando corretamente os campos da tabela para o tipo Notification
      return data ? data.map(item => ({
        id: item.id,
        userId: item.usuario_id,
        processId: item.processo_id,
        message: item.mensagem,
        read: item.lida,
        createdAt: item.created_at,
        respondida: item.respondida
      })) : [];
      
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return [];
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      return false;
    }
  };

  const markAllAsRead = async () => {
    try {
      if (!user) return false;

      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('usuario_id', user.id)
        .eq('lida', false);

      if (error) throw error;
      
      return true;
    } catch (error) {
      console.error('Erro ao marcar todas notificações como lidas:', error);
      return false;
    }
  };

  const notifyDepartmentUsers = async (processId: string, departmentId: string, message: string) => {
    try {
      // Buscar todos os usuários do departamento
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('id')
        .filter('setores_atribuidos', 'cs', `{${departmentId}}`);

      if (usersError) throw usersError;
      
      if (!users || users.length === 0) {
        console.warn(`Nenhum usuário encontrado para o departamento ${departmentId}`);
        return true;
      }

      // Criar notificações para cada usuário do departamento
      const notifications = users.map(user => ({
        usuario_id: user.id,
        processo_id: processId,
        mensagem: message,
        tipo: 'movimento',
        lida: false,
        respondida: false
      }));

      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .insert(notifications);

      if (notificationsError) throw notificationsError;

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificações:', error);
      return false;
    }
  };

  return {
    fetchNotifications,
    markAsRead,
    markAllAsRead,
    notifyDepartmentUsers
  };
};
