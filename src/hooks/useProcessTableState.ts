
import { useState, useCallback, useEffect, useRef } from "react";
import { Process } from "@/types";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useAuth } from "./auth";

/**
 * Hook para gerenciar o estado da tabela de processos
 */
export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  const { getProcessResponsible, getSectorResponsible, getBulkResponsibles } = useProcessResponsibility();
  const { user } = useAuth();
  
  // Controle de quais setores precisam ser carregados
  const loadQueueRef = useRef<Map<string, Set<string>>>(new Map());
  const isLoadingRef = useRef(false);
  
  // Controle de debounce para carregamento
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  /**
   * Adiciona um processo/setor à fila para carregamento
   */
  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    const currentQueue = loadQueueRef.current;
    
    if (!currentQueue.has(processId)) {
      currentQueue.set(processId, new Set([sectorId]));
    } else {
      currentQueue.get(processId)?.add(sectorId);
    }
    
    // Acionar carregamento com debounce
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    
    debounceTimerRef.current = setTimeout(processPendingLoads, 300);
  }, []);
  
  /**
   * Processa os carregamentos pendentes na fila
   */
  const processPendingLoads = useCallback(async () => {
    if (isLoadingRef.current) return;
    if (!user) return;
    
    isLoadingRef.current = true;
    
    try {
      const queue = loadQueueRef.current;
      
      if (queue.size === 0) return;
      
      // Processar todas as solicitações em batch
      const processIds = Array.from(queue.keys());
      const responsiblesData = await getBulkResponsibles(processIds);
      
      // Atualizar o estado com os novos dados
      setProcessesResponsibles(prev => {
        const result = { ...prev };
        
        // Para cada processo na fila
        for (const [processId, sectors] of queue.entries()) {
          if (!result[processId]) {
            result[processId] = {};
          }
          
          // Adicionar dados de responsáveis encontrados
          if (responsiblesData[processId]) {
            for (const sectorId of sectors) {
              if (responsiblesData[processId][sectorId]) {
                result[processId][sectorId] = responsiblesData[processId][sectorId];
              }
            }
          }
        }
        
        return result;
      });
      
      // Limpar a fila após processamento
      loadQueueRef.current.clear();
    } finally {
      isLoadingRef.current = false;
    }
  }, [getBulkResponsibles, user]);
  
  /**
   * Busca responsáveis para todos os processos exibidos
   */
  const fetchResponsibles = useCallback(async () => {
    if (!user || processes.length === 0) return;
    
    console.log(`Buscando responsáveis para ${processes.length} processos`);
    
    // Para cada processo, adicionar seu setor atual à fila de carregamento
    processes.forEach(process => {
      if (process.currentDepartment) {
        queueSectorForLoading(process.id, process.currentDepartment);
      }
    });
    
    // Processar a fila
    await processPendingLoads();
    
    console.log(`Responsáveis carregados para ${Object.keys(processesResponsibles).length} processos`);
  }, [processes, user, queueSectorForLoading, processPendingLoads, processesResponsibles]);
  
  /**
   * Verifica se existe um responsável para o processo no setor especificado
   */
  const hasResponsibleInSector = useCallback((processId: string, sectorId: string): boolean => {
    return !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][sectorId]
    );
  }, [processesResponsibles]);
  
  /**
   * Verifica se o usuário atual é responsável pelo processo no setor especificado
   */
  const isUserResponsibleForSector = useCallback((processId: string, sectorId: string): boolean => {
    if (!user) return false;
    
    return !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][sectorId] &&
      processesResponsibles[processId][sectorId].usuario_id === user.id
    );
  }, [processesResponsibles, user]);
  
  // Efeito para limpar timer de debounce
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);
  
  return {
    processesResponsibles,
    fetchResponsibles,
    hasResponsibleInSector,
    isUserResponsibleForSector,
    queueSectorForLoading
  };
};
