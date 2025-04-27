
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { saveDateToDatabase } from "@/utils/dateUtils";

export const useNotificationService = () => {
  const { toast } = useToast();
  
  const sendNotificationsToSectorUsers = async (
    processId: string, 
    sectorId: string, 
    protocolNumber: string
  ) => {
    try {
      // Buscar apenas uma vez os usuários do setor
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('id')
        .filter('setores_atribuidos', 'cs', `{${sectorId}}`)
        .eq('ativo', true);
      
      if (usersError) {
        throw usersError;
      }
      
      if (!users || users.length === 0) {
        console.log(`Nenhum usuário encontrado para o setor ${sectorId}`);
        return true;
      }
      
      // Preparar todas as notificações em um array
      const now = saveDateToDatabase(new Date());
      const notifications = users.map(user => ({
        processo_id: processId,
        usuario_id: user.id,
        mensagem: `O processo ${protocolNumber} foi movido para seu setor e requer atenção.`,
        tipo: 'movimento',
        lida: false,
        respondida: false,
        data_criacao: now,
        created_at: now,
        updated_at: now
      }));
      
      // Inserir todas as notificações em uma única chamada
      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .insert(notifications);
      
      if (notificationsError) {
        throw notificationsError;
      }
      
      console.log(`Notificações enviadas para ${users.length} usuários do setor ${sectorId}`);
      return true;
    } catch (error) {
      console.error('Erro ao enviar notificações para usuários do setor:', error);
      toast({
        title: "Aviso",
        description: "Não foi possível enviar notificações para os usuários do setor.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    sendNotificationsToSectorUsers
  };
};
