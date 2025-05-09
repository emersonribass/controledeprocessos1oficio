import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/types";
import { Tables } from "@/integrations/supabase/schema";
import { saveDateToDatabase } from "@/utils/dateUtils";

export const useNotificationsService = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar notificações para um usuário específico
  const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('notificacoes')
        .select('*')
        .eq('usuario_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      // Mapear os dados para o nosso tipo Notification
      const notifications: Notification[] = data.map(n => ({
        ...n,
        message: n.mensagem
      }));

      return notifications;
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Marcar notificação como lida
  const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como lida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Marcar notificação como respondida
  const markNotificationAsResponded = async (notificationId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('notificacoes')
        .update({ respondida: true })
        .eq('id', notificationId);

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao marcar notificação como respondida:', error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como respondida.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Criar uma nova notificação
  const createNotification = async (
    processId: string, 
    userId: string, 
    message: string,
    type: string = 'movimento'
  ): Promise<boolean> => {
    try {
      const now = saveDateToDatabase(new Date());
      const { error } = await supabase
        .from('notificacoes')
        .insert({
          processo_id: processId,
          usuario_id: userId,
          mensagem: message,
          tipo: type,
          lida: false,
          respondida: false,
          data_criacao: now,
          created_at: now,
          updated_at: now
        });

      if (error) {
        throw error;
      }
      return true;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      toast({
        title: "Erro",
        description: "Não foi possível criar a notificação.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Nova função para notificar todos os usuários de um departamento
  const notifyDepartmentUsers = async (
    processId: string,
    departmentId: string,
    message: string,
    type: string = 'movimento'
  ): Promise<boolean> => {
    try {
      // Primeiro, buscar todos os usuários associados ao departamento
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('id')
        .filter('setores_atribuidos', 'cs', `{${departmentId}}`);
      
      if (usersError) {
        throw usersError;
      }

      // Se não houver usuários no departamento, não há notificações para enviar
      if (!users || users.length === 0) {
        console.log(`Nenhum usuário encontrado para o setor ${departmentId}`);
        return true;
      }

      // Criar notificações para cada usuário do departamento
      const notificationPromises = users.map(user => 
        createNotification(processId, user.id, message, type)
      );
      
      // Aguardar todas as notificações serem criadas
      await Promise.all(notificationPromises);
      
      return true;
    } catch (error) {
      console.error('Erro ao notificar usuários do departamento:', error);
      toast({
        title: "Erro",
        description: "Não foi possível enviar notificações para os usuários do setor.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    fetchUserNotifications,
    markNotificationAsRead,
    markNotificationAsResponded,
    createNotification,
    notifyDepartmentUsers,
    isLoading
  };
};
