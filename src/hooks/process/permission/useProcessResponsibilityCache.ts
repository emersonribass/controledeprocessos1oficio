
import { Process } from "@/types";
import { useMemo, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para gerenciar cache de responsabilidades de processos por setor
 */
export const useProcessResponsibilityCache = (processes: Process[]) => {
  // Cache de responsabilidades por processo e setor usando useRef para manter entre renderizações
  const processResponsibilitiesCacheRef = useRef<Record<string, Record<string, boolean>>>({});
  const sectorResponsibleCacheRef = useRef<Record<string, boolean>>({});
  
  // Controle para evitar múltiplas requisições simultâneas
  const pendingRequestsRef = useRef<Record<string, Promise<boolean>>>({});
  
  // Inicializa o cache se ainda não existir
  useMemo(() => {
    if (Object.keys(processResponsibilitiesCacheRef.current).length === 0) {
      // Pré-inicializa o cache com valores vazios para cada processo
      processes.forEach(process => {
        if (!processResponsibilitiesCacheRef.current[process.id]) {
          processResponsibilitiesCacheRef.current[process.id] = {};
        }
      });
    }
  }, [processes]);

  /**
   * Limpa o cache de responsabilidades para forçar uma nova verificação
   */
  const clearResponsibilityCache = () => {
    processResponsibilitiesCacheRef.current = {};
    sectorResponsibleCacheRef.current = {};
    pendingRequestsRef.current = {};
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
    // Verificar se já temos no cache
    if (
      processResponsibilitiesCacheRef.current[processId] && 
      processResponsibilitiesCacheRef.current[processId][sectorId] !== undefined
    ) {
      return processResponsibilitiesCacheRef.current[processId][sectorId];
    }
    
    // Criar chave única para esta requisição
    const requestKey = `${processId}:${sectorId}:${userId}`;
    
    // Se já existe uma requisição pendente para esta mesma combinação, reutilizá-la
    if (pendingRequestsRef.current[requestKey]) {
      return pendingRequestsRef.current[requestKey];
    }
    
    try {
      // Criar uma nova Promise para esta requisição
      const requestPromise = new Promise<boolean>(async (resolve) => {
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
            resolve(false);
            return;
          }
          
          // Armazenar resultado no cache
          const isResponsible = !!data;
          if (!processResponsibilitiesCacheRef.current[processId]) {
            processResponsibilitiesCacheRef.current[processId] = {};
          }
          processResponsibilitiesCacheRef.current[processId][sectorId] = isResponsible;
          
          resolve(isResponsible);
        } catch (error) {
          console.error("Erro ao verificar responsabilidade para setor:", error);
          resolve(false);
        }
      });
      
      // Armazenar a promise no cache de requisições pendentes
      pendingRequestsRef.current[requestKey] = requestPromise;
      
      // Aguardar o resultado
      const result = await requestPromise;
      
      // Remover do cache de requisições pendentes após conclusão
      delete pendingRequestsRef.current[requestKey];
      
      return result;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade para setor:", error);
      return false;
    }
  };
  
  /**
   * Função para verificar se existe um responsável para o processo no setor
   */
  const hasSectorResponsible = async (processId: string, sectorId: string): Promise<boolean> => {
    // Verificar se já temos no cache
    const cacheKey = `${processId}:${sectorId}`;
    if (sectorResponsibleCacheRef.current[cacheKey] !== undefined) {
      return sectorResponsibleCacheRef.current[cacheKey];
    }
    
    // Se já existe uma requisição pendente para esta mesma combinação, reutilizá-la
    if (pendingRequestsRef.current[cacheKey]) {
      return pendingRequestsRef.current[cacheKey];
    }
    
    try {
      // Criar uma nova Promise para esta requisição
      const requestPromise = new Promise<boolean>(async (resolve) => {
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
            resolve(false);
            return;
          }
          
          const hasResponsible = count !== null && count > 0;
          
          // Armazenar no cache
          sectorResponsibleCacheRef.current[cacheKey] = hasResponsible;
          
          resolve(hasResponsible);
        } catch (error) {
          console.error("Erro ao verificar responsáveis de setor:", error);
          resolve(false);
        }
      });
      
      // Armazenar a promise no cache de requisições pendentes
      pendingRequestsRef.current[cacheKey] = requestPromise;
      
      // Aguardar o resultado
      const result = await requestPromise;
      
      // Remover do cache de requisições pendentes após conclusão
      delete pendingRequestsRef.current[cacheKey];
      
      return result;
    } catch (error) {
      console.error("Erro ao verificar responsáveis de setor:", error);
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
