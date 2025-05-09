
import { supabase } from "@/integrations/supabase/client";

export const useProcessResponsibilityVerification = () => {
  /**
   * Verifica se um usuário específico é responsável por um processo
   */
  const isUserResponsibleForProcess = async (processId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .single();

      if (error) {
        throw error;
      }

      return data && data.usuario_responsavel === userId;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade pelo processo:", error);
      return false;
    }
  };

  /**
   * Verifica se um usuário é responsável por um processo em um setor específico
   */
  const isUserResponsibleForSector = async (processId: string, sectorId: string, userId: string) => {
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', userId);

      if (error) {
        throw error;
      }

      return data && data.length > 0;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade pelo setor:", error);
      return false;
    }
  };

  return {
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  };
};
