
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

/**
 * Hook para buscar responsáveis de processos individualmente
 */
export const useProcessResponsibleFetching = () => {
  const { user } = useAuth();

  /**
   * Busca o responsável principal de um processo específico
   */
  const getProcessResponsible = useCallback(async (processId: string) => {
    if (!user) return null;
    
    try {
      // Buscar apenas o processo solicitado
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .maybeSingle();
      
      if (processError) {
        console.error(`Erro ao buscar processo ${processId}:`, processError);
        return null;
      }
      
      if (!process || !process.usuario_responsavel) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .maybeSingle();
      
      if (userError) {
        console.error(`Erro ao buscar usuário responsável pelo processo ${processId}:`, userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do processo ${processId}:`, error);
      return null;
    }
  }, [user]);

  /**
   * Busca o responsável de um processo em um setor específico
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    if (!user) return null;
    
    try {
      // Buscar o responsável do setor específico para um processo específico
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();
      
      if (error) {
        console.error(`Erro ao buscar responsável do setor ${sectorId} para o processo ${processId}:`, error);
        return null;
      }
      
      if (!data || !data.usuario_id) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.usuario_id)
        .maybeSingle();
      
      if (userError) {
        console.error(`Erro ao buscar usuário responsável pelo setor ${sectorId}:`, userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do setor ${sectorId} para o processo ${processId}:`, error);
      return null;
    }
  }, [user]);

  return {
    getProcessResponsible,
    getSectorResponsible
  };
};
