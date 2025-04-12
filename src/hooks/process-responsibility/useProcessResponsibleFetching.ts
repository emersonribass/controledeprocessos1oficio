
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";

export const useProcessResponsibleFetching = () => {
  /**
   * Obtém o usuário responsável pelo processo
   */
  const getProcessResponsible = async (processId: string): Promise<ProcessResponsible | null> => {
    try {
      console.log("Buscando responsável para o processo:", processId);
      
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .single();

      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        return null;
      }

      if (!process || !process.usuario_responsavel) {
        console.log("Processo não tem responsável definido");
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .single();

      if (userError) {
        console.error("Erro ao buscar usuário responsável:", userError);
        return null;
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
      console.log("Buscando responsável para o processo no setor:", processId, sectorId);
      
      if (!processId || !sectorId) {
        console.log("ID do processo ou setor não fornecido");
        return null;
      }
      
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);

      if (error) {
        console.error("Erro ao buscar responsável no setor:", error);
        return null;
      }

      if (!data || data.length === 0) {
        console.log("Nenhum responsável encontrado para este setor");
        return null;
      }

      const { data: user, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data[0].usuario_id)
        .single();

      if (userError) {
        console.error("Erro ao buscar dados do usuário responsável:", userError);
        return null;
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
