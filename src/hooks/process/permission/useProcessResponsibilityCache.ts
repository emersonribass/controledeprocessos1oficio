
import { Process } from "@/types";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para gerenciar cache de responsabilidades de processos por setor
 */
export const useProcessResponsibilityCache = (processes: Process[]) => {
  // Cache de responsabilidades por processo e setor
  const processResponsibilitiesCache = useMemo(() => {
    const cache: Record<string, Record<string, boolean>> = {};
    
    // Pré-inicializa o cache com valores vazios para cada processo
    processes.forEach(process => {
      if (!cache[process.id]) {
        cache[process.id] = {};
      }
    });
    
    return cache;
  }, [processes]);

  /**
   * Função para verificar e armazenar em cache se um usuário é responsável por um processo em um setor
   */
  const checkAndCacheResponsibility = async (
    processId: string, 
    sectorId: string, 
    userId: string
  ): Promise<boolean> => {
    // Verificar se já temos no cache
    if (
      processResponsibilitiesCache[processId] && 
      processResponsibilitiesCache[processId][sectorId] !== undefined
    ) {
      return processResponsibilitiesCache[processId][sectorId];
    }
    
    try {
      // Consultar a tabela setor_responsaveis
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar responsabilidade:", error);
        return false;
      }
      
      // Armazenar resultado no cache
      const isResponsible = !!data;
      if (!processResponsibilitiesCache[processId]) {
        processResponsibilitiesCache[processId] = {};
      }
      processResponsibilitiesCache[processId][sectorId] = isResponsible;
      
      return isResponsible;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade para setor:", error);
      return false;
    }
  };
  
  /**
   * Função para verificar se existe um responsável para o processo no setor
   */
  const hasSectorResponsible = async (processId: string, sectorId: string): Promise<boolean> => {
    try {
      // Modificado para usar .select('count') em vez de .maybeSingle()
      // porque pode haver múltiplos responsáveis por setor
      const { data, error, count } = await supabase
        .from('setor_responsaveis')
        .select('*', { count: 'exact', head: true })
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (error) {
        console.error("Erro ao verificar existência de responsável no setor:", error);
        return false;
      }
      
      return count !== null && count > 0;
    } catch (error) {
      console.error("Erro ao verificar responsáveis de setor:", error);
      return false;
    }
  };

  return {
    processResponsibilitiesCache,
    checkAndCacheResponsibility,
    hasSectorResponsible
  };
};
