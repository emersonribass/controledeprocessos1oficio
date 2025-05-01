
import { useState, useEffect, useCallback, useRef } from "react";
import { Process } from "@/types";
import { useProcessFetcher } from "./process-fetch/useProcessFetcher";
import { useProcessFormatter } from "./process-fetch/useProcessFormatter";

/**
 * Hook otimizado para buscar e formatar processos
 */
export const useProcessesFetch = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const { fetchProcessesData, isLoading, setIsLoading } = useProcessFetcher();
  const { formatProcesses } = useProcessFormatter();
  const isMountedRef = useRef(true);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Adicionar referência para controlar se já carregou dados
  const initialLoadCompleteRef = useRef(false);

  // Limpeza ao desmontar o componente
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      // Reseta o status de carregamento ao desmontar
      initialLoadCompleteRef.current = false;
    };
  }, []);

  // Função otimizada para buscar processos com debounce
  const fetchProcesses = useCallback(async () => {
    try {
      if (!isMountedRef.current) return;
      setIsLoading(true);
      
      const processesData = await fetchProcessesData();
      
      // Converter para o formato do nosso tipo Process
      const formattedProcesses = formatProcesses(processesData);

      if (isMountedRef.current) {
        setProcesses(formattedProcesses);
        initialLoadCompleteRef.current = true;
      }
    } catch (error) {
      console.error('Erro ao processar dados dos processos:', error);
      // Definir um array vazio mesmo em caso de erro
      if (isMountedRef.current) {
        setProcesses([]);
        initialLoadCompleteRef.current = true;
      }
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchProcessesData, formatProcesses, setIsLoading]);

  // Função com debounce para reagendamento de atualização
  const debouncedFetchProcesses = useCallback(async () => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }
    
    return new Promise<void>((resolve) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        await fetchProcesses();
        resolve();
      }, 300); // 300ms de debounce para evitar múltiplas chamadas em sequência
    });
  }, [fetchProcesses]);

  useEffect(() => {
    // Carregar processos automaticamente ao montar o componente apenas se não carregou ainda
    if (!initialLoadCompleteRef.current) {
      fetchProcesses().catch(error => {
        console.error("Erro ao buscar processos:", error);
        setIsLoading(false); // Garantir que o loading termina mesmo com erro
      });
    }
  }, [fetchProcesses, setIsLoading]);

  return {
    processes,
    isLoading,
    fetchProcesses: debouncedFetchProcesses,
    setProcesses
  };
};
