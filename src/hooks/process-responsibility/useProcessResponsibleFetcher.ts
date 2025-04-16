
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";
import { useProcessResponsibleCache } from "./useProcessResponsibleCache";

/**
 * Hook para buscar responsáveis por processos
 */
export const useProcessResponsibleFetcher = () => {
  const {
    isProcessRequestPending,
    isRequestInProgress,
    markRequestInProgress,
    markRequestCompleted,
    storeProcessRequest,
    removeProcessRequest,
    getProcessResponsibleFromCache,
    getProcessPendingRequest,
    updateProcessResponsibleCache
  } = useProcessResponsibleCache();

  /**
   * Busca o usuário responsável pelo processo
   */
  const fetchUserById = useCallback(async (userId: string): Promise<ProcessResponsible | null> => {
    console.log("Buscando detalhes do usuário:", userId);
    
    const { data: user, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (userError) {
      console.error("Erro ao buscar usuário:", userError);
      return null;
    }

    if (!user) {
      console.log("Usuário não encontrado");
      return null;
    }

    console.log("Detalhes do usuário encontrados:", user.nome);
    return user;
  }, []);

  /**
   * Obtém o usuário responsável pelo processo com controle de cache melhorado
   */
  const getProcessResponsible = useCallback(async (processId: string): Promise<ProcessResponsible | null> => {
    // Verifica se já temos o resultado em cache
    const cachedResult = getProcessResponsibleFromCache(processId);
    if (cachedResult !== undefined) {
      console.log("Usando cache para responsável do processo:", processId);
      return cachedResult;
    }

    // Verifica se já existe uma requisição em andamento para este processo
    const pendingRequest = getProcessPendingRequest(processId);
    if (pendingRequest) {
      console.log("Usando requisição em andamento para responsável do processo:", processId);
      return pendingRequest;
    }
    
    // Evita requisições duplicadas para o mesmo processo
    if (isRequestInProgress(`process_${processId}`)) {
      console.log("Requisição já em andamento para:", processId);
      return null;
    }
    
    markRequestInProgress(`process_${processId}`);

    try {
      console.log("Iniciando busca de responsável para o processo:", processId);
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      const request = (async () => {
        try {
          const { data: process, error: processError } = await supabase
            .from('processos')
            .select('usuario_responsavel')
            .eq('id', processId)
            .maybeSingle();

          if (processError) {
            console.error("Erro ao buscar processo:", processError);
            updateProcessResponsibleCache(processId, null);
            return null;
          }

          if (!process || !process.usuario_responsavel) {
            console.log("Processo não tem responsável definido:", processId);
            updateProcessResponsibleCache(processId, null);
            return null;
          }

          console.log("Responsável encontrado para o processo, buscando detalhes do usuário:", process.usuario_responsavel);

          const user = await fetchUserById(process.usuario_responsavel);
          
          // Atualiza o cache
          updateProcessResponsibleCache(processId, user);
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          removeProcessRequest(processId);
          markRequestCompleted(`process_${processId}`);
        }
      })();

      storeProcessRequest(processId, request);
      return await request;
    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      updateProcessResponsibleCache(processId, null);
      markRequestCompleted(`process_${processId}`);
      return null;
    }
  }, [
    getProcessResponsibleFromCache,
    getProcessPendingRequest,
    isRequestInProgress,
    markRequestInProgress,
    markRequestCompleted,
    storeProcessRequest,
    removeProcessRequest,
    updateProcessResponsibleCache,
    fetchUserById
  ]);

  return {
    getProcessResponsible,
    fetchUserById
  };
};
