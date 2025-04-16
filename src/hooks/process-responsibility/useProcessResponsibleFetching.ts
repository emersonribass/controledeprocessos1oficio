
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";
import { useState, useRef, useCallback } from "react";

export const useProcessResponsibleFetching = () => {
  // Cache para armazenar os responsáveis já buscados
  const [processResponsibleCache, setProcessResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibleCache, setSectorResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  
  // Controle de requisições em andamento para evitar chamadas duplicadas
  const pendingProcessRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});
  const pendingSectorRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});
  
  // Flag para evitar multiplas requisições
  const isFetchingRef = useRef<Record<string, boolean>>({});

  /**
   * Obtém o usuário responsável pelo processo com controle de cache melhorado
   */
  const getProcessResponsible = useCallback(async (processId: string): Promise<ProcessResponsible | null> => {
    // Verifica se já temos o resultado em cache
    if (processResponsibleCache[processId] !== undefined) {
      return processResponsibleCache[processId];
    }

    // Verifica se já existe uma requisição em andamento para este processo
    if (pendingProcessRequests.current[processId]) {
      return pendingProcessRequests.current[processId];
    }
    
    // Evita requisições duplicadas para o mesmo processo
    if (isFetchingRef.current[`process_${processId}`]) {
      return null;
    }
    
    isFetchingRef.current[`process_${processId}`] = true;

    try {
      console.log("Buscando responsável para o processo:", processId);
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      pendingProcessRequests.current[processId] = (async () => {
        try {
          const { data: process, error: processError } = await supabase
            .from('processos')
            .select('usuario_responsavel')
            .eq('id', processId)
            .maybeSingle();

          if (processError) {
            console.error("Erro ao buscar processo:", processError);
            setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
            return null;
          }

          if (!process || !process.usuario_responsavel) {
            console.log("Processo não tem responsável definido");
            setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
            return null;
          }

          const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', process.usuario_responsavel)
            .maybeSingle();

          if (userError) {
            console.error("Erro ao buscar usuário responsável:", userError);
            setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
            return null;
          }

          if (!user) {
            console.log("Usuário responsável não encontrado");
            setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
            return null;
          }

          // Atualiza o cache
          setProcessResponsibleCache(prev => ({ ...prev, [processId]: user }));
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          delete pendingProcessRequests.current[processId];
          delete isFetchingRef.current[`process_${processId}`];
        }
      })();

      return await pendingProcessRequests.current[processId];
    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
      delete isFetchingRef.current[`process_${processId}`];
      return null;
    }
  }, [processResponsibleCache]);

  /**
   * Obtém o usuário responsável pelo processo em um setor específico com controle de cache melhorado
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    // Cria uma chave única para o cache
    const cacheKey = `${processId}-${sectorId}`;
    
    // Verifica se já temos o resultado em cache
    if (sectorResponsibleCache[cacheKey] !== undefined) {
      return sectorResponsibleCache[cacheKey];
    }
    
    // Verifica se já existe uma requisição em andamento para este setor
    if (pendingSectorRequests.current[cacheKey]) {
      return pendingSectorRequests.current[cacheKey];
    }
    
    // Evita requisições duplicadas para o mesmo setor
    if (isFetchingRef.current[`sector_${cacheKey}`]) {
      return null;
    }
    
    isFetchingRef.current[`sector_${cacheKey}`] = true;
    
    try {
      console.log("Buscando responsável para o processo no setor:", processId, sectorId);
      
      if (!processId || !sectorId) {
        console.log("ID do processo ou setor não fornecido");
        setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
        delete isFetchingRef.current[`sector_${cacheKey}`];
        return null;
      }
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      pendingSectorRequests.current[cacheKey] = (async () => {
        try {
          const { data, error } = await supabase
            .from('setor_responsaveis')
            .select('usuario_id')
            .eq('processo_id', processId)
            .eq('setor_id', sectorId)
            .maybeSingle();

          if (error) {
            console.error("Erro ao buscar responsável no setor:", error);
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          if (!data || !data.usuario_id) {
            console.log("Nenhum responsável encontrado para este setor");
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data.usuario_id)
            .maybeSingle();

          if (userError) {
            console.error("Erro ao buscar dados do usuário responsável:", userError);
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          if (!user) {
            console.log("Usuário responsável pelo setor não encontrado");
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          // Atualiza o cache
          setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: user }));
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          delete pendingSectorRequests.current[cacheKey];
          delete isFetchingRef.current[`sector_${cacheKey}`];
        }
      })();

      return await pendingSectorRequests.current[cacheKey];
    } catch (error) {
      console.error("Erro ao obter responsável pelo setor:", error);
      setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
      delete isFetchingRef.current[`sector_${cacheKey}`];
      return null;
    }
  }, [sectorResponsibleCache]);

  /**
   * Limpa o cache de responsáveis
   */
  const clearCache = useCallback(() => {
    setProcessResponsibleCache({});
    setSectorResponsibleCache({});
    pendingProcessRequests.current = {};
    pendingSectorRequests.current = {};
    isFetchingRef.current = {};
  }, []);

  return {
    getProcessResponsible,
    getSectorResponsible,
    clearCache
  };
};
