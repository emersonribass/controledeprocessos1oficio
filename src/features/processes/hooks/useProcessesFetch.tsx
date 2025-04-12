
import { useState, useEffect, useCallback, useRef } from "react";
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
  const lastFetchTimeRef = useRef<number>(0);
  const isFetchingRef = useRef<boolean>(false);

  // Extrair a lógica de fetching para useCallback para evitar recriações desnecessárias
  const fetchProcesses = useCallback(async () => {
    // Evitar múltiplas requisições simultâneas
    if (isFetchingRef.current) {
      console.log('Já existe uma busca em andamento, ignorando este pedido');
      return;
    }

    // Limitar frequência de atualizações (mínimo 5 segundos entre atualizações)
    const now = Date.now();
    const timeSinceLastFetch = now - lastFetchTimeRef.current;
    if (lastFetchTimeRef.current > 0 && timeSinceLastFetch < 5000) {
      console.log('Tentativas de atualização muito frequentes, aguardando intervalo mínimo');
      return;
    }

    try {
      isFetchingRef.current = true;
      lastFetchTimeRef.current = now;
      
      const processesData = await fetchProcessesData();
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);

      setProcesses(formattedProcesses);
    } catch (error) {
      console.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      // Não atualizar se já temos dados para evitar resets desnecessários
      if (processes.length === 0) {
        setProcesses([]);
      }
    } finally {
      isFetchingRef.current = false;
    }
  }, [fetchProcessesData, formatProcesses, processes.length]);

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
