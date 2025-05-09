
import { Process } from "@/types";
import { useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessResponsibilityCache");

/**
 * Hook para gerenciar cache de responsabilidades de processos por setor
 */
export const useProcessResponsibilityCache = (processes: Process[]) => {
  // Cache de responsabilidades por processo e setor usando useRef para manter entre renderizações
  const processResponsibilitiesCacheRef = useRef<Record<string, Record<string, boolean>>>({});
  
  // Inicializa o cache se ainda não existir
  useMemo(() => {
    if (Object.keys(processResponsibilitiesCacheRef.current).length === 0) {
      // Pré-inicializa o cache com valores vazios para cada processo
      processes.forEach(process => {
        if (!processResponsibilitiesCacheRef.current[process.id]) {
          processResponsibilitiesCacheRef.current[process.id] = {};
        }
      });
      
      logger.debug(`Cache de responsabilidades inicializado para ${processes.length} processos`);
    }
  }, [processes]);

  /**
   * Limpa o cache de responsabilidades para forçar uma nova verificação
   */
  const clearResponsibilityCache = () => {
    logger.info("Limpando cache de responsabilidades");
    processResponsibilitiesCacheRef.current = {};
    // Reinicializa o cache
    processes.forEach(process => {
      if (!processResponsibilitiesCacheRef.current[process.id]) {
        processResponsibilitiesCacheRef.current[process.id] = {};
      }
    });
  };

  /**
   * Função para verificar e armazenar em cache se um usuário é responsável por um processo em um setor
   */
  const checkAndCacheResponsibility = async (
    processId: string, 
    sectorId: string, 
    userId: string
  ): Promise<boolean> => {
    logger.debug(`Verificando responsabilidade para processo=${processId}, setor=${sectorId}, usuário=${userId}`);
    
    // Verificar se já temos no cache
    if (
      processResponsibilitiesCacheRef.current[processId] && 
      processResponsibilitiesCacheRef.current[processId][sectorId] !== undefined
    ) {
      const cachedResult = processResponsibilitiesCacheRef.current[processId][sectorId];
      logger.debug(`Usando valor em cache: ${cachedResult}`);
      return cachedResult;
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
        logger.error("Erro ao verificar responsabilidade:", error);
        return false;
      }
      
      // Armazenar resultado no cache
      const isResponsible = !!data;
      logger.debug(`Resultado da verificação: ${isResponsible ? "É responsável" : "Não é responsável"}`);
      
      if (!processResponsibilitiesCacheRef.current[processId]) {
        processResponsibilitiesCacheRef.current[processId] = {};
      }
      processResponsibilitiesCacheRef.current[processId][sectorId] = isResponsible;
      
      return isResponsible;
    } catch (error) {
      logger.error("Erro ao verificar responsabilidade para setor:", error);
      return false;
    }
  };
  
  /**
   * Função para verificar se existe um responsável para o processo no setor
   */
  const hasSectorResponsible = async (processId: string, sectorId: string): Promise<boolean> => {
    logger.debug(`Verificando existência de responsável para processo=${processId}, setor=${sectorId}`);
    
    try {
      // Modificado para usar .select('count') em vez de .maybeSingle()
      // porque pode haver múltiplos responsáveis por setor
      const { data, error, count } = await supabase
        .from('setor_responsaveis')
        .select('*', { count: 'exact', head: true })
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (error) {
        logger.error("Erro ao verificar existência de responsável no setor:", error);
        return false;
      }
      
      const hasResponsible = count !== null && count > 0;
      logger.debug(`Resultado: ${hasResponsible ? "Tem responsável" : "Não tem responsável"}, count=${count}`);
      
      return hasResponsible;
    } catch (error) {
      logger.error("Erro ao verificar responsáveis de setor:", error);
      return false;
    }
  };

  return {
    processResponsibilitiesCache: processResponsibilitiesCacheRef.current,
    checkAndCacheResponsibility,
    hasSectorResponsible,
    clearResponsibilityCache
  };
};
