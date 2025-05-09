
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

  logger.debug("useProcessesFetch inicializado");

  useEffect(() => {
    // Carregar processos automaticamente ao montar o componente
    logger.info("Iniciando carregamento automático de processos");
    fetchProcesses().catch(error => {
      logger.error("Erro ao buscar processos:", error);
      setIsLoading(false); // Garantir que o loading termina mesmo com erro
    });
  }, []);

  const fetchProcesses = async (): Promise<void> => {
    logger.info("Buscando processos...");
    try {
      setIsLoading(true);
      const processesData = await fetchProcessesData();
      logger.debug(`Dados brutos de ${processesData.length} processos recebidos`);
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);
      logger.debug(`${formattedProcesses.length} processos formatados com sucesso`);
      
      // Logar os primeiros processos para debug
      formattedProcesses.forEach((proc, index) => {
        if (index < 3) { // Limitar a quantidade de logs para evitar poluição
          logger.debug(`Processo ${index + 1}/${formattedProcesses.length}: ID=${proc.id}, Protocolo=${proc.protocolNumber}, Status=${proc.status}, Setor=${proc.currentDepartment}`);
        }
      });
      
      // Definir os processos formatados no estado
      setProcesses(formattedProcesses);
      logger.info(`${formattedProcesses.length} processos carregados com sucesso`);
    } catch (error) {
      logger.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      setProcesses([]);
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
