
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

export const useNotificationService = () => {
  const { user } = useAuth();

  /**
   * Envia notificações para todos os usuários atribuídos a um setor específico
   * @param processId ID do processo
   * @param sectorId ID do setor para notificar usuários
   * @param protocolNumber Número do protocolo do processo (para incluir na mensagem)
   * @returns Número de notificações enviadas
   */
  const sendNotificationsToSectorUsers = async (
    processId: string,
    sectorId: string,
    protocolNumber: string
  ): Promise<number> => {
    if (!user) return 0;

    try {
      // Buscar usuários atribuídos ao setor
      const { data: users, error } = await supabase
        .from("usuarios")
        .select("id, nome")
        .contains("setores_atribuidos", [sectorId])
        .eq("ativo", true);

      if (error) {
        console.error("Erro ao buscar usuários do setor:", error);
        throw error;
      }

      if (!users || users.length === 0) {
        console.log(`Nenhum usuário encontrado para o setor ${sectorId}`);
        return 0;
      }

      console.log(`Encontrados ${users.length} usuários para o setor ${sectorId}`);

      // Preparar as notificações para cada usuário
      const notifications = users.map((u) => ({
        usuario_id: u.id,
        processo_id: processId,
        mensagem: `O processo ${protocolNumber} foi movido para o seu setor.`,
        tipo: "processo_movido",
        lida: false,
        respondida: false,
        data_criacao: new Date().toISOString(),
      }));

      // Inserir as notificações
      const { error: insertError } = await supabase
        .from("notificacoes")
        .insert(notifications);

      if (insertError) {
        console.error("Erro ao inserir notificações:", insertError);
        throw insertError;
      }

      return notifications.length;
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
      return 0;
    }
  };

  return {
    sendNotificationsToSectorUsers,
  };
};
