
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from "./types";
import { useState, useRef } from "react";

export const useProcessResponsibleFetching = () => {
  // Cache para armazenar os responsáveis já buscados
  const [processResponsibleCache, setProcessResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibleCache, setSectorResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  
  // Controle de requisições em andamento para evitar chamadas duplicadas
  const pendingProcessRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});
  const pendingSectorRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});

  /**
   * Obtém o usuário responsável pelo processo
   */
  const getProcessResponsible = async (processId: string): Promise<ProcessResponsible | null> => {
    // Verifica se já temos o resultado em cache
    if (processResponsibleCache[processId] !== undefined) {
      return processResponsibleCache[processId];
    }

    // Verifica se já existe uma requisição em andamento para este processo
    if (pendingProcessRequests.current[processId]) {
      return pendingProcessRequests.current[processId];
    }

    try {
      console.log("Buscando responsável para o processo:", processId);
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      pendingProcessRequests.current[processId] = (async () => {
        try {
          const { data: process, error: processError } = await supabase
            .from('processos')
            .select('usuario_responsavel')
            .eq('id', processId)
            .single();

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
            .single();

          if (userError) {
            console.error("Erro ao buscar usuário responsável:", userError);
            setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
            return null;
          }

          // Atualiza o cache
          setProcessResponsibleCache(prev => ({ ...prev, [processId]: user }));
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          delete pendingProcessRequests.current[processId];
        }
      })();

      return await pendingProcessRequests.current[processId];
    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
      return null;
    }
  };

  /**
   * Obtém o usuário responsável pelo processo em um setor específico
   */
  const getSectorResponsible = async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
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
    
    try {
      console.log("Buscando responsável para o processo no setor:", processId, sectorId);
      
      if (!processId || !sectorId) {
        console.log("ID do processo ou setor não fornecido");
        setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
        return null;
      }
      
      // Cria uma nova promessa e a armazena para evitar requisições duplicadas
      pendingSectorRequests.current[cacheKey] = (async () => {
        try {
          const { data, error } = await supabase
            .from('setor_responsaveis')
            .select('usuario_id')
            .eq('processo_id', processId)
            .eq('setor_id', sectorId);

          if (error) {
            console.error("Erro ao buscar responsável no setor:", error);
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          if (!data || data.length === 0) {
            console.log("Nenhum responsável encontrado para este setor");
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          const { data: user, error: userError } = await supabase
            .from('usuarios')
            .select('*')
            .eq('id', data[0].usuario_id)
            .single();

          if (userError) {
            console.error("Erro ao buscar dados do usuário responsável:", userError);
            setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
            return null;
          }

          // Atualiza o cache
          setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: user }));
          return user;
        } finally {
          // Remove a requisição da lista de pendentes quando terminar
          delete pendingSectorRequests.current[cacheKey];
        }
      })();

      return await pendingSectorRequests.current[cacheKey];
    } catch (error) {
      console.error("Erro ao obter responsável pelo setor:", error);
      setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: null }));
      return null;
    }
  };

  /**
   * Limpa o cache de responsáveis
   */
  const clearCache = () => {
    setProcessResponsibleCache({});
    setSectorResponsibleCache({});
    pendingProcessRequests.current = {};
    pendingSectorRequests.current = {};
  };

  return {
    getProcessResponsible,
    getSectorResponsible,
    clearCache
  };
};
