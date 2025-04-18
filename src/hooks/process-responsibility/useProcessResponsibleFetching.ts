
import { useState, useCallback, useMemo } from "react";
import { ProcessResponsible } from "./types";
import { useResponsibilityLoader } from "./useResponsibilityLoader";
import { supabase } from "@/integrations/supabase/client";

export const useProcessResponsibleFetching = () => {
  const [processResponsibleCache, setProcessResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  const { loadResponsible, preloadResponsibles, isLoading } = useResponsibilityLoader();
  
  // Memoização do objeto cache para evitar re-renders desnecessários
  const memoizedCache = useMemo(() => processResponsibleCache, [processResponsibleCache]);
  
  const getProcessResponsible = useCallback(async (processId: string): Promise<ProcessResponsible | null> => {
    // Verificar se já temos em cache
    if (memoizedCache[processId] !== undefined) {
      return memoizedCache[processId];
    }

    try {
      console.log("Buscando responsável para o processo:", processId);
      
      const { data, error } = await supabase
        .from('processos')
        .select(`
          usuario_responsavel,
          usuarios!processos_usuario_responsavel_fkey (
            id,
            nome,
            email
          )
        `)
        .eq('id', processId)
        .maybeSingle();

      if (error) throw error;
      
      const responsible = data?.usuarios as ProcessResponsible | null;
      
      // Atualizar cache de forma imutável
      setProcessResponsibleCache(prev => ({
        ...prev,
        [processId]: responsible
      }));
      
      return responsible;

    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      
      // Armazenar valor null no cache para evitar requisições repetidas
      setProcessResponsibleCache(prev => ({
        ...prev,
        [processId]: null
      }));
      
      return null;
    }
  }, [memoizedCache]);

  const getSectorResponsible = useCallback(async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    // Criamos uma chave única para o cache combinando processo e setor
    const cacheKey = `${processId}:${sectorId}`;
    
    // Verificar cache primeiro
    if (memoizedCache[cacheKey] !== undefined) {
      return memoizedCache[cacheKey];
    }
    
    try {
      const responsible = await loadResponsible(processId, sectorId);
      
      // Atualizar cache
      if (responsible) {
        setProcessResponsibleCache(prev => ({
          ...prev,
          [cacheKey]: responsible
        }));
      }
      
      return responsible;
    } catch (error) {
      console.error("Erro ao buscar responsável do setor:", error);
      
      // Armazenar null no cache para evitar requisições repetidas
      setProcessResponsibleCache(prev => ({
        ...prev,
        [cacheKey]: null
      }));
      
      return null;
    }
  }, [memoizedCache, loadResponsible]);

  const clearCache = useCallback(() => {
    setProcessResponsibleCache({});
  }, []);

  return {
    getProcessResponsible,
    getSectorResponsible,
    preloadResponsibles,
    clearCache,
    isLoading
  };
};
