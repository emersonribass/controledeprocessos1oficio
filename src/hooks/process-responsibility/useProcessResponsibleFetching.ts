
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useResponsibleCache } from "./useResponsibleCache";

/**
 * Hook para buscar informações de responsáveis por processos
 * Implementa otimizações de cache e controle de requisições
 */
export const useProcessResponsibleFetching = () => {
  const { user } = useAuth();
  const { 
    getFromCache, 
    addToCache, 
    isRequestPending, 
    setRequestPending 
  } = useResponsibleCache();

  /**
   * Obtém o responsável principal de um processo
   */
  const getProcessResponsible = useCallback(async (processId: string, processStatus?: string) => {
    // Se o processo não foi iniciado ou não há usuário autenticado, não busque responsável
    if (!user || processStatus === 'not_started') return null;
    
    // Chave para identificar responsável principal no cache
    const cacheKey = "main";
    
    // Tenta obter do cache primeiro
    const cachedData = getFromCache(processId, cacheKey);
    if (cachedData) {
      console.log(`Usando cache para responsável principal do processo ${processId}`);
      return cachedData;
    }
    
    // Verifica se já há uma requisição pendente para evitar duplicação
    if (isRequestPending(processId, cacheKey)) {
      console.log(`Requisição já em andamento para responsável do processo ${processId}`);
      return null;
    }
    
    // Marca requisição como pendente
    setRequestPending(processId, cacheKey, true);
    
    try {
      // Busca o processo para obter o ID do usuário responsável
      const processData = await fetchProcessData(processId);
      
      if (!processData || !processData.usuario_responsavel) {
        addToCache(processId, cacheKey, null);
        return null;
      }
      
      // Busca os dados do usuário responsável
      const responsibleUser = await fetchUserData(processData.usuario_responsavel);
      
      // Adiciona ao cache e retorna
      addToCache(processId, cacheKey, responsibleUser);
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do processo ${processId}:`, error);
      return null;
    } finally {
      // Marca requisição como finalizada
      setRequestPending(processId, cacheKey, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  /**
   * Busca dados básicos do processo no banco de dados
   */
  const fetchProcessData = async (processId: string) => {
    const { data: process, error: processError } = await supabase
      .from('processos')
      .select('usuario_responsavel')
      .eq('id', processId)
      .maybeSingle();
    
    if (processError) {
      console.error(`Erro ao buscar processo ${processId}:`, processError);
      return null;
    }
    
    return process;
  };

  /**
   * Busca dados do usuário responsável
   */
  const fetchUserData = async (userId: string) => {
    const { data: responsibleUser, error: userError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    
    if (userError) {
      console.error(`Erro ao buscar usuário ${userId}:`, userError);
      return null;
    }
    
    return responsibleUser;
  };

  /**
   * Obtém o responsável de um processo em um setor específico
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string, processStatus?: string) => {
    // Se o processo não foi iniciado ou não há usuário autenticado, não busque responsável
    if (!user || processStatus === 'not_started') return null;
    
    // Tenta obter do cache primeiro
    const cachedData = getFromCache(processId, sectorId);
    if (cachedData) {
      console.log(`Usando cache para responsável do processo ${processId} no setor ${sectorId}`);
      return cachedData;
    }
    
    // Verifica se já há uma requisição pendente para evitar duplicação
    if (isRequestPending(processId, sectorId)) {
      console.log(`Requisição já em andamento para processo ${processId}, setor ${sectorId}`);
      return null;
    }
    
    // Marca requisição como pendente
    setRequestPending(processId, sectorId, true);
    
    try {
      // Busca o responsável do setor para este processo
      const sectorResponsibleData = await fetchSectorResponsible(processId, sectorId);
      
      if (!sectorResponsibleData || !sectorResponsibleData.usuario_id) {
        addToCache(processId, sectorId, null);
        return null;
      }
      
      // Busca os dados do usuário responsável pelo setor
      const responsibleUser = await fetchUserData(sectorResponsibleData.usuario_id);
      
      // Adiciona ao cache e retorna
      addToCache(processId, sectorId, responsibleUser);
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do setor ${sectorId} para o processo ${processId}:`, error);
      return null;
    } finally {
      // Marca requisição como finalizada
      setRequestPending(processId, sectorId, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  /**
   * Busca o responsável de um setor específico para um processo
   */
  const fetchSectorResponsible = async (processId: string, sectorId: string) => {
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
    
    return data;
  };

  /**
   * Busca responsáveis para múltiplos processos em uma única requisição
   */
  const getBulkResponsibles = useCallback(async (processIds: string[]) => {
    if (!user || processIds.length === 0) return {};
    
    try {
      // Busca todos os responsáveis de setor para os processos especificados
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('processo_id, setor_id, usuario_id')
        .in('processo_id', processIds);
      
      if (error) {
        console.error("Erro ao buscar responsáveis em massa:", error);
        return {};
      }
      
      // Organiza os resultados por processo e setor
      const results = processResponseData(data);
      
      return results;
    } catch (error) {
      console.error("Erro ao buscar responsáveis em massa:", error);
      return {};
    }
  }, [user, addToCache]);

  /**
   * Processa e organiza os dados da resposta em um formato utilizável
   */
  const processResponseData = (data: any[]) => {
    const results: Record<string, Record<string, { usuario_id: string }>> = {};
    
    data.forEach(item => {
      if (!results[item.processo_id]) {
        results[item.processo_id] = {};
      }
      
      results[item.processo_id][item.setor_id] = { 
        usuario_id: item.usuario_id 
      };
      
      // Adiciona os dados ao cache para uso futuro
      addToCache(item.processo_id, item.setor_id, { id: item.usuario_id });
    });
    
    return results;
  };

  return {
    getProcessResponsible,
    getSectorResponsible,
    getBulkResponsibles
  };
};
