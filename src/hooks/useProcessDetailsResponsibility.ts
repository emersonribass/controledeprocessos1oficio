import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { ProcessResponsible } from "./process-responsibility/types";
import { useProcessResponsibleBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

/**
 * Hook para gerenciar responsáveis de um processo específico com carregamento eficiente
 */
export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<ProcessResponsible | null>(null);
  const [sectorResponsible, setSectorResponsible] = useState<ProcessResponsible | null>(null);
  const { 
    acceptProcessResponsibility, 
    isAccepting 
  } = useProcessResponsibility();
  
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibleBatchLoader();
  
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId || loadingInProgressRef.current) {
      return;
    }
    
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Carregando responsáveis: processo=${processId}, setor=${sectorId}`);
      
      const processResponsibles = await loadProcessResponsibleBatch([processId]);
      const procResp = processResponsibles[processId];
      setProcessResponsible(procResp);
      
      const sectorResponsibles = await loadSectorResponsibleBatch([
        { processId, sectorId }
      ]);
      
      const sectorResp = sectorResponsibles[`${processId}-${sectorId}`];
      setSectorResponsible(sectorResp);
      
      loadedRef.current = true;
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
      loadingInProgressRef.current = false;
    }
  }, [processId, sectorId, loadProcessResponsibleBatch, loadSectorResponsibleBatch]);

  const handleAcceptResponsibility = useCallback(async (protocolNumber: string): Promise<void> => {
    if (!processId || !protocolNumber) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        await loadResponsibles();
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  useEffect(() => {
    if (processId && sectorId && !loadedRef.current) {
      loadResponsibles();
    }
    
    return () => {
      loadedRef.current = false;
    };
  }, [loadResponsibles, processId, sectorId]);

  return {
    isLoading,
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    refreshResponsibles: loadResponsibles
  };
};
