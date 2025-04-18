
import { useState, useCallback } from "react";
import { ProcessResponsible } from "./types";
import { useResponsibilityLoader } from "./useResponsibilityLoader";
import { supabase } from "@/integrations/supabase/client";

export const useProcessResponsibleFetching = () => {
  const [processResponsibleCache, setProcessResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  const { loadResponsible, preloadResponsibles, isLoading } = useResponsibilityLoader();
  
  const getProcessResponsible = useCallback(async (processId: string): Promise<ProcessResponsible | null> => {
    if (processResponsibleCache[processId] !== undefined) {
      return processResponsibleCache[processId];
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
      setProcessResponsibleCache(prev => ({ ...prev, [processId]: responsible }));
      return responsible;

    } catch (error) {
      console.error("Erro ao obter responsável pelo processo:", error);
      setProcessResponsibleCache(prev => ({ ...prev, [processId]: null }));
      return null;
    }
  }, [processResponsibleCache]);

  const getSectorResponsible = useCallback(async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    try {
      return await loadResponsible(processId, sectorId);
    } catch (error) {
      console.error("Erro ao buscar responsável do setor:", error);
      return null;
    }
  }, [loadResponsible]);

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
