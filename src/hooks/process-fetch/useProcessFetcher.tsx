
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar processos
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `);

      if (processesError) {
        throw processesError;
      }

      // Buscar todos os setores separadamente
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        throw departmentsError;
      }

      // Combinar os dados dos processos com os setores correspondentes
      const processesWithDepartments = processesData.map((process: any) => {
        // Encontrar o setor que corresponde ao setor_atual do processo
        const matchingDept = departmentsData.find(
          (dept: any) => dept.id.toString() === process.setor_atual
        );
        
        // Retornar o processo com as informações do setor
        return {
          ...process,
          setor_info: matchingDept || null
        };
      });

      return processesWithDepartments;
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
