
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";
import { useProcessResponsibleCache } from "./useProcessResponsibleCache";
import { useProcessResponsibleFetcher } from "./useProcessResponsibleFetcher";

/**
 * Hook para buscar responsáveis por setores
 */
export const useSectorResponsibleFetcher = () => {
  const {
    isSectorRequestPending,
    isRequestInProgress,
    markRequestInProgress,
    markRequestCompleted,
    storeSectorRequest,
    removeSectorRequest,
    getSectorResponsibleFromCache,
    getSectorPendingRequest,
    updateSectorResponsibleCache
  } = useProcessResponsibleCache();
  
  const { fetchUserById } = useProcessResponsibleFetcher();

  /**
   * Obtém o usuário responsável pelo processo em um setor específico com controle de cache melhorado
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    // Cria uma chave única para o cache
    const cacheKey = `${processId}-${sectorId}`;
    
    // Verifica se já temos o resultado em cache
    const cachedResult = getSectorResponsibleFromCache(cacheKey);
    if (cachedResult !== undefined) {
      console.log("Usando cache para responsável do setor:", cacheKey);
      return cachedResult;
    }
    
    // Verifica se já existe uma requisição em andamento para este setor
    const pendingRequest = getSectorPendingRequest(cacheKey);
    if (pendingRequest) {
      console.log("Usando requisição em andamento para responsável do setor:", cacheKey);
      return pendingRequest;
    }
    
    // Evita requisições duplicadas para o mesmo setor
    if (isRequestInProgress(`sector_${cacheKey}`)) {
      console.log("Requisição já em andamento para setor:", cacheKey);
      return null;
    }
    
    markRequestInProgress(`sector_${cacheKey}`);
    
    try {
      console.log("Iniciando busca de responsável para o processo no setor:", processId, sectorId);
      
      if (!processId || !sectorId) {
        console.log("ID do processo ou setor não fornecido");
        updateSectorResponsibleCache(cacheKey, null);
        markRequestCompleted(`sector_${cacheKey}`);
        return null;
      }
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      const request = (async () => {
        try {
          const { data, error } = await supabase
            .from('setor_responsaveis')
            .select('usuario_id')
            .eq('processo_id', processId)
            .eq('setor_id', sectorId)
            .maybeSingle();

          if (error) {
            console.error("Erro ao buscar responsável no setor:", error);
            updateSectorResponsibleCache(cacheKey, null);
            return null;
          }

          if (!data || !data.usuario_id) {
            console.log("Nenhum responsável encontrado para o setor:", sectorId);
            updateSectorResponsibleCache(cacheKey, null);
            return null;
          }

          console.log("Responsável encontrado para o setor, buscando detalhes do usuário:", data.usuario_id);

          const user = await fetchUserById(data.usuario_id);
          
          // Atualiza o cache
          updateSectorResponsibleCache(cacheKey, user);
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          removeSectorRequest(cacheKey);
          markRequestCompleted(`sector_${cacheKey}`);
        }
      })();

      storeSectorRequest(cacheKey, request);
      return await request;
    } catch (error) {
      console.error("Erro ao obter responsável pelo setor:", error);
      updateSectorResponsibleCache(cacheKey, null);
      markRequestCompleted(`sector_${cacheKey}`);
      return null;
    }
  }, [
    getSectorResponsibleFromCache,
    getSectorPendingRequest,
    isRequestInProgress,
    markRequestInProgress,
    markRequestCompleted,
    storeSectorRequest,
    removeSectorRequest,
    updateSectorResponsibleCache,
    fetchUserById
  ]);

  return {
    getSectorResponsible
  };
};
