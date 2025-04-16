
import { useState, useEffect, useRef } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { useProcessResponsibleBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

/**
 * Hook centralizado para gerenciar o carregamento em lote de responsáveis
 * Evita requisições duplicadas e implementa controle de concorrência
 */
export const useProcessBatchLoader = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibles, setSectorResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibleBatchLoader();
  
  // Controle para carregamento em lote
  const batchLoadingRef = useRef(false);
  const pendingProcessIds = useRef<string[]>([]);
  const pendingSectorRequests = useRef<Array<{ processId: string; sectorId: string }>>([]);
  const processIdsToLoad = useRef<string[]>([]);
  const sectorIdsToLoad = useRef<Array<{ processId: string; sectorId: string }>>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Função para adicionar um processo ao lote de carregamento
   */
  const queueProcessForLoading = (processId: string): void => {
    if (!processId || processResponsibles[processId] !== undefined) {
      return;
    }
    
    if (!pendingProcessIds.current.includes(processId)) {
      pendingProcessIds.current.push(processId);
      scheduleBatchLoad();
    }
  };
  
  /**
   * Função para adicionar um setor ao lote de carregamento
   */
  const queueSectorForLoading = (processId: string, sectorId: string): void => {
    if (!processId || !sectorId) return;
    
    const cacheKey = `${processId}-${sectorId}`;
    if (sectorResponsibles[cacheKey] !== undefined) {
      return;
    }
    
    const existingRequest = pendingSectorRequests.current.find(
      item => item.processId === processId && item.sectorId === sectorId
    );
    
    if (!existingRequest) {
      pendingSectorRequests.current.push({ processId, sectorId });
      scheduleBatchLoad();
    }
  };
  
  /**
   * Agenda o processamento do lote com um pequeno atraso para acumular requisições
   */
  const scheduleBatchLoad = (): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      processBatch();
    }, 50); // Aguarda 50ms para acumular requisições
  };
  
  /**
   * Processa o lote acumulado de requisições
   */
  const processBatch = async (): Promise<void> => {
    if (batchLoadingRef.current) return;
    
    const processBatch = [...pendingProcessIds.current];
    const sectorBatch = [...pendingSectorRequests.current];
    
    if (processBatch.length === 0 && sectorBatch.length === 0) return;
    
    batchLoadingRef.current = true;
    setIsLoading(true);
    
    // Limpa as listas de pendências
    pendingProcessIds.current = [];
    pendingSectorRequests.current = [];
    
    try {
      // Processamento em paralelo
      const promises: Promise<any>[] = [];
      
      if (processBatch.length > 0) {
        console.log(`Processando lote de ${processBatch.length} responsáveis de processos`);
        promises.push(loadProcessResponsibleBatch(processBatch).then(result => {
          setProcessResponsibles(prev => ({ ...prev, ...result }));
          return result;
        }));
      }
      
      if (sectorBatch.length > 0) {
        console.log(`Processando lote de ${sectorBatch.length} responsáveis de setores`);
        promises.push(loadSectorResponsibleBatch(sectorBatch).then(result => {
          setSectorResponsibles(prev => ({ ...prev, ...result }));
          return result;
        }));
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error("Erro ao processar lote:", error);
    } finally {
      batchLoadingRef.current = false;
      setIsLoading(false);
    }
  };
  
  /**
   * Limpa os recursos ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Obtém um responsável por processo do cache
   */
  const getProcessResponsible = (processId: string): ProcessResponsible | null | undefined => {
    if (!processId) return undefined;
    
    const result = processResponsibles[processId];
    
    if (result === undefined) {
      queueProcessForLoading(processId);
    }
    
    return result;
  };
  
  /**
   * Obtém um responsável por setor do cache
   */
  const getSectorResponsible = (processId: string, sectorId: string): ProcessResponsible | null | undefined => {
    if (!processId || !sectorId) return undefined;
    
    const cacheKey = `${processId}-${sectorId}`;
    const result = sectorResponsibles[cacheKey];
    
    if (result === undefined) {
      queueSectorForLoading(processId, sectorId);
    }
    
    return result;
  };
  
  return {
    isLoading,
    processResponsibles,
    sectorResponsibles,
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading,
    processBatch
  };
};
