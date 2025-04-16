
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useResponsibleCache } from "./useResponsibleCache";

/**
 * Hook para buscar responsáveis de processos individualmente com cache eficiente
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
   * Busca o responsável principal de um processo específico com suporte a cache
   */
  const getProcessResponsible = useCallback(async (processId: string) => {
    if (!user) return null;
    
    // Usar ID do processo como setor para o cache do responsável principal
    const cacheKey = "main";
    
    // Verificar cache primeiro
    const cachedData = getFromCache(processId, cacheKey);
    if (cachedData) {
      console.log(`Usando cache para responsável principal do processo ${processId}`);
      return cachedData;
    }
    
    // Verificar se já existe uma requisição em andamento
    if (isRequestPending(processId, cacheKey)) {
      console.log(`Requisição já em andamento para responsável do processo ${processId}`);
      return null;
    }
    
    setRequestPending(processId, cacheKey, true);
    
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
        // Armazenar valor nulo no cache também
        addToCache(processId, cacheKey, null);
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
      
      // Armazenar no cache
      addToCache(processId, cacheKey, responsibleUser);
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do processo ${processId}:`, error);
      return null;
    } finally {
      setRequestPending(processId, cacheKey, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  /**
   * Busca o responsável de um processo em um setor específico com suporte a cache
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    if (!user) return null;
    
    // Verificar cache primeiro
    const cachedData = getFromCache(processId, sectorId);
    if (cachedData) {
      console.log(`Usando cache para responsável do processo ${processId} no setor ${sectorId}`);
      return cachedData;
    }
    
    // Verificar se já existe uma requisição em andamento
    if (isRequestPending(processId, sectorId)) {
      console.log(`Requisição já em andamento para processo ${processId}, setor ${sectorId}`);
      return null;
    }
    
    setRequestPending(processId, sectorId, true);
    
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
        // Armazenar valor nulo no cache também
        addToCache(processId, sectorId, null);
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
      
      // Armazenar no cache
      addToCache(processId, sectorId, responsibleUser);
      
      if (responsibleUser) {
        console.log(`Responsável encontrado para processo ${processId}, setor ${sectorId}: ${responsibleUser.id}`);
      }
      
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do setor ${sectorId} para o processo ${processId}:`, error);
      return null;
    } finally {
      setRequestPending(processId, sectorId, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  /**
   * Busca apenas os IDs de responsáveis para um conjunto de processos
   * (versão mais eficiente para listagens)
   */
  const getBulkResponsibles = useCallback(async (processIds: string[]) => {
    if (!user || processIds.length === 0) return {};
    
    try {
      // Buscar todos os responsáveis de setor de uma vez
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('processo_id, setor_id, usuario_id')
        .in('processo_id', processIds);
      
      if (error) {
        console.error("Erro ao buscar responsáveis em massa:", error);
        return {};
      }
      
      // Organizar os resultados por processo e setor
      const results: Record<string, Record<string, { usuario_id: string }>> = {};
      
      data.forEach(item => {
        if (!results[item.processo_id]) {
          results[item.processo_id] = {};
        }
        
        results[item.processo_id][item.setor_id] = { 
          usuario_id: item.usuario_id 
        };
        
        // Também armazenar no cache
        addToCache(item.processo_id, item.setor_id, { id: item.usuario_id });
      });
      
      return results;
    } catch (error) {
      console.error("Erro ao buscar responsáveis em massa:", error);
      return {};
    }
  }, [user, addToCache]);

  return {
    getProcessResponsible,
    getSectorResponsible,
    getBulkResponsibles
  };
};
