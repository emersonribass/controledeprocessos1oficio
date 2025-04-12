
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";

export const useProcessResponsibleFetching = () => {
  /**
   * Obtém o usuário responsável pelo processo
   */
  const getProcessResponsible = async (processId: string): Promise<ProcessResponsible | null> => {
    try {
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .single();

      if (processError) {
        throw processError;
      }

      if (!process || !process.usuario_responsavel) {
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .single();

      if (userError) {
        throw userError;
      }

      return user;
    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      return null;
    }
  };

  /**
   * Obtém o usuário responsável pelo processo em um setor específico
   */
  const getSectorResponsible = async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);

      if (error) {
        throw error;
      }

      if (!data || data.length === 0) {
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data[0].usuario_id)
        .single();

      if (userError) {
        throw userError;
      }

      return user;
    } catch (error) {
      console.error("Erro ao obter responsável pelo setor:", error);
      return null;
    }
  };

  return {
    getProcessResponsible,
    getSectorResponsible
  };
};
