
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
          setor_info:setores(id, name, time_limit)
        `);

      if (error) {
        throw error;
      }

      // Filtrar para garantir que o setor_info corresponda ao setor_atual do processo
      const processesWithCorrectDepartment = processesData.map(process => {
        // Filtrar para obter apenas o setor que corresponde ao setor_atual
        const matchingDept = process.setor_info.find(
          dept => dept.id.toString() === process.setor_atual
        );
        
        // Retornar o processo com apenas o setor correspondente
        return {
          ...process,
          setor_info: matchingDept || null
        };
      });

      return processesWithCorrectDepartment;
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
