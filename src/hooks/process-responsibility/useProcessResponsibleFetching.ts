import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useResponsibleCache } from "./useResponsibleCache";

export const useProcessResponsibleFetching = () => {
  const { user } = useAuth();
  const { 
    getFromCache, 
    addToCache, 
    isRequestPending, 
    setRequestPending 
  } = useResponsibleCache();

  const getProcessResponsible = useCallback(async (processId: string, processStatus?: string) => {
    if (!user || processStatus === 'not_started') return null;
    
    const cacheKey = "main";
    
    const cachedData = getFromCache(processId, cacheKey);
    if (cachedData) {
      console.log(`Usando cache para responsável principal do processo ${processId}`);
      return cachedData;
    }
    
    if (isRequestPending(processId, cacheKey)) {
      console.log(`Requisição já em andamento para responsável do processo ${processId}`);
      return null;
    }
    
    setRequestPending(processId, cacheKey, true);
    
    try {
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
        addToCache(processId, cacheKey, null);
        return null;
      }
      
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .maybeSingle();
      
      if (userError) {
        console.error(`Erro ao buscar usuário responsável pelo processo ${processId}:`, userError);
        return null;
      }
      
      addToCache(processId, cacheKey, responsibleUser);
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do processo ${processId}:`, error);
      return null;
    } finally {
      setRequestPending(processId, cacheKey, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  const getSectorResponsible = useCallback(async (processId: string, sectorId: string, processStatus?: string) => {
    if (!user || processStatus === 'not_started') return null;
    
    const cachedData = getFromCache(processId, sectorId);
    if (cachedData) {
      console.log(`Usando cache para responsável do processo ${processId} no setor ${sectorId}`);
      return cachedData;
    }
    
    if (isRequestPending(processId, sectorId)) {
      console.log(`Requisição já em andamento para processo ${processId}, setor ${sectorId}`);
      return null;
    }
    
    setRequestPending(processId, sectorId, true);
    
    try {
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
        addToCache(processId, sectorId, null);
        return null;
      }
      
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.usuario_id)
        .maybeSingle();
      
      if (userError) {
        console.error(`Erro ao buscar usuário responsável pelo setor ${sectorId}:`, userError);
        return null;
      }
      
      addToCache(processId, sectorId, responsibleUser);
      
      return responsibleUser;
    } catch (error) {
      console.error(`Erro ao buscar responsável do setor ${sectorId} para o processo ${processId}:`, error);
      return null;
    } finally {
      setRequestPending(processId, sectorId, false);
    }
  }, [user, getFromCache, addToCache, isRequestPending, setRequestPending]);

  const getBulkResponsibles = useCallback(async (processIds: string[]) => {
    if (!user || processIds.length === 0) return {};
    
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('processo_id, setor_id, usuario_id')
        .in('processo_id', processIds);
      
      if (error) {
        console.error("Erro ao buscar responsáveis em massa:", error);
        return {};
      }
      
      const results: Record<string, Record<string, { usuario_id: string }>> = {};
      
      data.forEach(item => {
        if (!results[item.processo_id]) {
          results[item.processo_id] = {};
        }
        
        results[item.processo_id][item.setor_id] = { 
          usuario_id: item.usuario_id 
        };
        
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
