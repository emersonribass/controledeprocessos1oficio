
import { useState, useEffect } from "react";
import { Process } from "@/types";
import { useProcessFetcher } from "./process-fetch/useProcessFetcher";
import { useProcessFormatter } from "./process-fetch/useProcessFormatter";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessesFetch");

/**
 * Hook para buscar e formatar processos
 */
export const useProcessesFetch = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const { fetchProcessesData, isLoading, setIsLoading } = useProcessFetcher();
  const { formatProcesses } = useProcessFormatter();

  useEffect(() => {
    // Carregar processos automaticamente ao montar o componente
    logger.debug("Iniciando carregamento automático de processos");
    fetchProcesses().catch(error => {
      console.error("Erro ao buscar processos:", error);
      setIsLoading(false); // Garantir que o loading termina mesmo com erro
    });
  }, []);

  const fetchProcesses = async () => {
    try {
      logger.debug("Buscando processos do banco de dados");
      setIsLoading(true);
      const processesData = await fetchProcessesData();
      
      logger.debug(`Recebido ${processesData?.length || 0} processos do banco`);
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);
      logger.debug(`Formatados ${formattedProcesses.length} processos`);

      setProcesses(formattedProcesses);
      return formattedProcesses;
    } catch (error) {
      console.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      setProcesses([]);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    setProcesses
  };
};
