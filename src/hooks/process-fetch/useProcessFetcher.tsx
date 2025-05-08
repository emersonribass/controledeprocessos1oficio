
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessFetcher");

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      logger.debug("Iniciando busca de processos");
      
      // Buscar processos
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `);

      if (processesError) {
        logger.error("Erro ao buscar processos:", processesError);
        throw processesError;
      }

      logger.debug(`Encontrados ${processesData?.length || 0} processos`);
      
      if (!processesData || processesData.length === 0) {
        logger.debug("Nenhum processo encontrado no banco de dados");
        return [];
      }

      // Buscar todos os setores separadamente
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        logger.error("Erro ao buscar setores:", departmentsError);
        throw departmentsError;
      }

      logger.debug(`Encontrados ${departmentsData?.length || 0} setores`);

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
      logger.error('Erro ao buscar processos:', error);
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
