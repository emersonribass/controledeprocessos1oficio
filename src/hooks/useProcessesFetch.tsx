
import { useState, useEffect, useCallback } from "react";
import { Process } from "@/types";
import { useProcessFetcher } from "./process-fetch/useProcessFetcher";
import { useProcessFormatter } from "./process-fetch/useProcessFormatter";

/**
 * Hook para buscar e formatar processos
 */
export const useProcessesFetch = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const { fetchProcessesData, isLoading, setIsLoading } = useProcessFetcher();
  const { formatProcesses } = useProcessFormatter();

  // Usar useCallback para evitar recriações desnecessárias da função
  const fetchProcesses = useCallback(async () => {
    try {
      const processesData = await fetchProcessesData();
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);

      setProcesses(formattedProcesses);
    } catch (error) {
      console.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      setProcesses([]);
    }
  }, [fetchProcessesData, formatProcesses]);

  // Carregar processos automaticamente ao montar o componente
  useEffect(() => {
    fetchProcesses().catch(error => {
      console.error("Erro ao buscar processos:", error);
      setIsLoading(false); // Garantir que o loading termina mesmo com erro
    });
  }, [fetchProcesses, setIsLoading]);

  /**
   * Função para atualizar um processo específico na lista sem recarregar tudo
   */
  const updateProcessInList = useCallback((updatedProcess: Process) => {
    setProcesses(prevProcesses => 
      prevProcesses.map(process => 
        process.id === updatedProcess.id ? updatedProcess : process
      )
    );
  }, []);

  return {
    processes,
    isLoading,
    fetchProcesses,
    setProcesses,
    updateProcessInList
  };
};
