
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Notification } from "@/types";

export const useNotificationsService = () => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  // Buscar notificações para um usuário específico
  const fetchUserNotifications = async (userId: string): Promise<Notification[]> => {
    setIsLoading(true);
    try {
      // Aqui usamos a notação de string para a tabela que não está no types.ts do Supabase
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
        id: n.id,
        userId: n.usuario_id,
        processId: n.processo_id,
        message: n.mensagem,
        read: n.lida,
        createdAt: n.created_at,
        type: n.tipo,
        responded: n.respondida
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
      // Usando a notação de string para evitar problemas de tipo
      const { error } = await supabase
        .from('notificacoes')
        .update({ lida: true } as any)
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
      // Usando a notação de string para evitar problemas de tipo
      const { error } = await supabase
        .from('notificacoes')
        .update({ respondida: true } as any)
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
      // Usando a notação de string para evitar problemas de tipo
      const { error } = await supabase
        .from('notificacoes')
        .insert({
          processo_id: processId,
          usuario_id: userId,
          mensagem: message,
          tipo: type,
          lida: false,
          respondida: false
        } as any);

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

  return {
    fetchUserNotifications,
    markNotificationAsRead,
    markNotificationAsResponded,
    createNotification,
    isLoading
  };
};
