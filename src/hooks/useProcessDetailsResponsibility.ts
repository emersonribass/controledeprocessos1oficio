
import { useState, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { ProcessResponsible } from "./process-responsibility/types";
import { useProcessBatchLoader } from "./useProcessBatchLoader";

/**
 * Hook para gerenciar responsáveis de um processo específico com carregamento eficiente
 */
export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const { 
    acceptProcessResponsibility, 
    isAccepting 
  } = useProcessResponsibility();
  
  const {
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading
  } = useProcessBatchLoader();
  
  // Carrega os responsáveis sob demanda
  const processResponsible = getProcessResponsible(processId);
  const sectorResponsible = getSectorResponsible(processId, sectorId);
  
  // Função para forçar uma atualização
  const refreshResponsibles = useCallback(() => {
    if (!processId || !sectorId) return;
    
    setIsLoading(true);
    queueProcessForLoading(processId);
    queueSectorForLoading(processId, sectorId);
    
    // Desativa o estado de loading após um breve intervalo
    setTimeout(() => {
      setIsLoading(false);
    }, 300);
  }, [processId, sectorId, queueProcessForLoading, queueSectorForLoading]);

  // Carrega inicialmente os responsáveis quando os IDs são fornecidos
  useState(() => {
    if (processId && sectorId) {
      queueProcessForLoading(processId);
      queueSectorForLoading(processId, sectorId);
      
      // Desativa o estado de loading após um breve intervalo
      setTimeout(() => {
        setIsLoading(false);
      }, 300);
    }
  });

  const handleAcceptResponsibility = useCallback(async (protocolNumber: string): Promise<void> => {
    if (!processId || !protocolNumber) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        refreshResponsibles();
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    }
  }, [processId, acceptProcessResponsibility, refreshResponsibles]);

  return {
    isLoading: isLoading && (processResponsible === undefined || sectorResponsible === undefined),
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    refreshResponsibles
  };
};
