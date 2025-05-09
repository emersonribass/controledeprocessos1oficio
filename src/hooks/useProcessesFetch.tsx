
import { useState, useEffect } from "react";
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

  useEffect(() => {
    // Carregar processos automaticamente ao montar o componente
    fetchProcesses().catch(error => {
      console.error("Erro ao buscar processos:", error);
      setIsLoading(false); // Garantir que o loading termina mesmo com erro
    });
  }, []);

  const fetchProcesses = async (): Promise<void> => {
    try {
      const processesData = await fetchProcessesData();
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);

      setProcesses(formattedProcesses);
      // Retornamos void para compatibilidade com a tipagem esperada
    } catch (error) {
      console.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      setProcesses([]);
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    setProcesses
  };
};
