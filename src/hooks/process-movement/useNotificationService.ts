
import { supabase } from "@/integrations/supabase/client";

export const useNotificationService = () => {
  /**
   * Envia notificações para todos os usuários do setor
   */
  const sendNotificationsToSectorUsers = async (processId: string, sectorId: string, protocolNumber: string) => {
    try {
      // Buscar todos os usuários que têm acesso ao setor
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('*')
        .contains('setores_atribuidos', [sectorId]);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log("Nenhum usuário encontrado para o setor:", sectorId);
        return;
      }

      // Enviar notificação para cada usuário
      const notifications = users.map(user => ({
        usuario_id: user.id,
        processo_id: processId,
        mensagem: `O processo ${protocolNumber} foi movido para seu setor. Clique para aceitar a responsabilidade.`,
        tipo: 'processo_movido',
        data_criacao: new Date().toISOString(),
        lida: false,
        respondida: false
      }));

      const { error: notifyError } = await supabase
        .from('notificacoes')
        .insert(notifications);

      if (notifyError) throw notifyError;

      console.log(`Notificações enviadas para ${users.length} usuários do setor ${sectorId}`);
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
    }
  };

  return { sendNotificationsToSectorUsers };
};
