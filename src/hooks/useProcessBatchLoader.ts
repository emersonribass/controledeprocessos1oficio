
import { useState, useRef, useEffect, useCallback } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { useProcessResponsibility } from "./process-responsibility/useProcessResponsibility";

/**
 * Hook para carregar responsáveis de processos em lote para melhor desempenho
 */
export const useProcessBatchLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibles, setSectorResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [pendingProcessCount, setPendingProcessCount] = useState(0);
  const [pendingSectorCount, setPendingSectorCount] = useState(0);
  const [batchSizes, setBatchSizes] = useState({ processes: 0, sectors: 0 });
  
  const { 
    isAssigning, 
    isAccepting, 
    assignResponsible, 
    acceptProcessResponsibility,
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  } = useProcessResponsibility();
  
  // Usamos conjuntos para evitar duplicatas
  const pendingProcessIds = useRef(new Set<string>());
  const pendingSectorRequests = useRef(new Set<string>());
  const batchLoadingRef = useRef(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Adiciona um processo à fila para carregamento em lote
   */
  const queueProcessForLoading = useCallback((processId: string) => {
    if (!processId || processResponsibles[processId] !== undefined) return;
    
    pendingProcessIds.current.add(processId);
    setPendingProcessCount(pendingProcessIds.current.size);
    scheduleProcessBatch();
  }, [processResponsibles]);
  
  /**
   * Adiciona um setor à fila para carregamento em lote
   */
  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    if (!processId || !sectorId) return;
    
    const key = `${processId}:${sectorId}`;
    if (sectorResponsibles[key] !== undefined) return;
    
    pendingSectorRequests.current.add(key);
    setPendingSectorCount(pendingSectorRequests.current.size);
    scheduleProcessBatch();
  }, [sectorResponsibles]);
  
  /**
   * Agenda o processamento em lote com debounce
   */
  const scheduleProcessBatch = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    timeoutRef.current = setTimeout(() => {
      processBatch();
    }, 50); // Agrupa solicitações em um curto intervalo para otimizar
  }, []);
  
  /**
   * Processa o lote de solicitações pendentes
   */
  const processBatch = useCallback(async () => {
    if (batchLoadingRef.current || 
        (pendingProcessIds.current.size === 0 && pendingSectorRequests.current.size === 0)) {
      return;
    }
    
    batchLoadingRef.current = true;
    setIsLoading(true);
    
    try {
      // Processar responsáveis de processos
      if (pendingProcessIds.current.size > 0) {
        const processIds = Array.from(pendingProcessIds.current);
        setBatchSizes(prev => ({ ...prev, processes: processIds.length }));
        
        // Implementação direta para buscar responsáveis por processos
        const results: Record<string, ProcessResponsible | null> = {};
        
        for (const processId of processIds) {
          try {
            const isResponsible = await isUserResponsibleForProcess(processId, "current");
            results[processId] = isResponsible ? { id: "current", name: "Você" } : null;
          } catch (error) {
            console.error(`Erro ao verificar responsável para processo ${processId}:`, error);
            results[processId] = null;
          }
        }
        
        setProcessResponsibles(prev => ({
          ...prev,
          ...results
        }));
        
        // Limpar os IDs processados
        pendingProcessIds.current.clear();
        setPendingProcessCount(0);
      }
      
      // Processar responsáveis de setores
      if (pendingSectorRequests.current.size > 0) {
        const sectorRequests = Array.from(pendingSectorRequests.current)
          .map(key => {
            const [processId, sectorId] = key.split(':');
            return { processId, sectorId };
          });
        
        setBatchSizes(prev => ({ ...prev, sectors: sectorRequests.length }));
        
        // Implementação direta para buscar responsáveis por setores
        const results: Record<string, ProcessResponsible | null> = {};
        
        for (const { processId, sectorId } of sectorRequests) {
          try {
            const isResponsible = await isUserResponsibleForSector(processId, sectorId, "current");
            const key = `${processId}:${sectorId}`;
            results[key] = isResponsible ? { id: "current", name: "Você" } : null;
          } catch (error) {
            console.error(`Erro ao verificar responsável para setor ${sectorId} no processo ${processId}:`, error);
            results[`${processId}:${sectorId}`] = null;
          }
        }
        
        setSectorResponsibles(prev => ({
          ...prev,
          ...results
        }));
        
        // Limpar as solicitações processadas
        pendingSectorRequests.current.clear();
        setPendingSectorCount(0);
      }
    } catch (error) {
      console.error("Erro ao carregar responsáveis em lote:", error);
    } finally {
      batchLoadingRef.current = false;
      setIsLoading(false);
    }
  }, [isUserResponsibleForProcess, isUserResponsibleForSector]);
  
  /**
   * Obtém o responsável por um processo específico
   */
  const getProcessResponsible = useCallback((processId: string): ProcessResponsible | null | undefined => {
    if (!processId) return null;
    
    const responsible = processResponsibles[processId];
    
    // Se não temos informação e não está na fila, adicionar à fila
    if (responsible === undefined && !pendingProcessIds.current.has(processId)) {
      queueProcessForLoading(processId);
    }
    
    return responsible;
  }, [processResponsibles, queueProcessForLoading]);
  
  /**
   * Obtém o responsável por um setor específico em um processo
   */
  const getSectorResponsible = useCallback((processId: string, sectorId: string): ProcessResponsible | null | undefined => {
    if (!processId || !sectorId) return null;
    
    const key = `${processId}:${sectorId}`;
    const responsible = sectorResponsibles[key];
    
    // Se não temos informação e não está na fila, adicionar à fila
    if (responsible === undefined && !pendingSectorRequests.current.has(key)) {
      queueSectorForLoading(processId, sectorId);
    }
    
    return responsible;
  }, [sectorResponsibles, queueSectorForLoading]);
  
  /**
   * Limpa o cache e todas as solicitações pendentes
   */
  const handleClearCache = useCallback(() => {
    setProcessResponsibles({});
    setSectorResponsibles({});
    pendingProcessIds.current.clear();
    pendingSectorRequests.current.clear();
    setPendingProcessCount(0);
    setPendingSectorCount(0);
  }, []);
  
  // Processa o lote automaticamente quando o componente é montado
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  return {
    isLoading,
    processResponsibles,
    sectorResponsibles,
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading,
    processBatch,
    clearCache: handleClearCache,
    pendingProcessCount,
    pendingSectorCount,
    batchSizes
  };
};
