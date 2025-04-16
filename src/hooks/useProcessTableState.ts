
import { useState, useCallback, useEffect, useRef } from "react";
import { Process } from "@/types";
import { useAuth } from "./auth";
import { useResponsibleBatchLoader } from "./process-responsibility/useResponsibleBatchLoader";

/**
 * Hook para gerenciar o estado da tabela de processos
 * utilizando o sistema de carregamento em lote
 */
export const useProcessTableState = (processes: Process[]) => {
  const { user } = useAuth();
  const { 
    responsiblesData,
    queueMultipleProcesses,
    hasResponsibleForSector,
    isUserResponsibleForSector
  } = useResponsibleBatchLoader();
  
  // Controla se o carregamento inicial já foi feito
  const initialLoadDoneRef = useRef(false);
  
  /**
   * Busca responsáveis para todos os processos exibidos
   */
  const fetchResponsibles = useCallback(async () => {
    if (!user || processes.length === 0) return;
    
    console.log(`Buscando responsáveis para ${processes.length} processos`);
    
    // Filtrar processos não iniciados antes de enfileirar
    const filteredProcesses = processes.filter(process => 
      process.status !== 'not_started'
    );
    
    // Enfileirar processos filtrados para carregamento
    const addedCount = queueMultipleProcesses(filteredProcesses);
    
    if (addedCount > 0) {
      console.log(`Enfileirados ${addedCount} processos para carregamento de responsáveis`);
    }
  }, [processes, user, queueMultipleProcesses]);
  
  // Efeito para carregar responsáveis quando os processos mudam
  useEffect(() => {
    if (processes.length > 0 && user && !initialLoadDoneRef.current) {
      fetchResponsibles();
      initialLoadDoneRef.current = true;
    }
  }, [processes, user, fetchResponsibles]);
  
  return {
    processesResponsibles: responsiblesData,
    fetchResponsibles,
    hasResponsibleInSector: hasResponsibleForSector,
    isUserResponsibleForSector,
    // Reaproveitar a função de enfileiramento do hook de lote
    queueSectorForLoading: (processId: string, sectorId: string) => {
      // Encontrar o status do processo para verificar se deve ser enfileirado
      const process = processes.find(p => p.id === processId);
      if (process && process.status !== 'not_started') {
        return queueMultipleProcesses([process]) > 0;
      }
      return false;
    }
  };
};
