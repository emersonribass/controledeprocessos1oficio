
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar processos com histórico
      const { data: processesData, error } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*),
          setor_info:setores!inner(id, name, time_limit)
        `)
        .eq('setores.id', supabase.raw('processos.setor_atual::int'));

      if (error) {
        throw error;
      }

      return processesData;
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProcessesData,
    isLoading,
    setIsLoading
  };
};
