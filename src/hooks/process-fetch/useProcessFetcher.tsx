
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessFetcher");

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      logger.info("Iniciando busca de processos no Supabase");
      setIsLoading(true);
      
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
      
      logger.debug(`${processesData?.length || 0} processos encontrados`);

      // Buscar todos os setores separadamente
      const { data: departmentsData, error: departmentsError } = await supabase
        .from('setores')
        .select('*');

      if (departmentsError) {
        logger.error("Erro ao buscar setores:", departmentsError);
        throw departmentsError;
      }
      
      logger.debug(`${departmentsData?.length || 0} setores encontrados`);

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
      
      logger.info(`${processesWithDepartments.length} processos combinados com informações de setores`);

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
