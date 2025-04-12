
import { useState, useEffect, useCallback } from "react";
import { Process } from "@/types";
import { useProcessFetcher } from "./useProcessFetcher";
import { useProcessFormatter } from "./useProcessFormatter";

interface ProcessesFetchResult {
  processes: Process[];
  isLoading: boolean;
  fetchProcesses: () => Promise<void>;
  setProcesses: React.Dispatch<React.SetStateAction<Process[]>>;
}

export const useProcessesFetch = (): ProcessesFetchResult => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const { fetchProcessesData, isLoading, setIsLoading } = useProcessFetcher();
  const { formatProcesses } = useProcessFormatter();

  // Extrair a lógica de fetching para useCallback para evitar recriações desnecessárias
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

  useEffect(() => {
    // Carregar processos automaticamente ao montar o componente
    fetchProcesses().catch(error => {
      console.error("Erro ao buscar processos:", error);
      setIsLoading(false); // Garantir que o loading termina mesmo com erro
    });
  }, [fetchProcesses, setIsLoading]);

  return {
    processes,
    isLoading,
    fetchProcesses,
    setProcesses
  };
};
