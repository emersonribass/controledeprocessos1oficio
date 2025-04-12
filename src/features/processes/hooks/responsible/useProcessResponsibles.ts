
import { useEffect, useCallback } from "react";
import { useSingleProcessResponsible } from "./useSingleProcessResponsible";
import { useMultipleProcessResponsibles } from "./useMultipleProcessResponsibles";
import { useProcessAccept } from "./useProcessAccept";
import { useResponsibilityUtilities } from "./useUtilities";
import { ProcessResponsiblesHookResult, UseProcessResponsiblesProps } from "./types";

/**
 * Hook principal unificado para gerenciar responsáveis de processos
 */
export const useProcessResponsibles = ({ 
  processes = [], 
  processId 
}: UseProcessResponsiblesProps): ProcessResponsiblesHookResult => {
  // Hook para responsabilidade de um único processo
  const {
    singleProcess,
    isMainResponsible,
    isSectorResponsible,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    fetchSingleProcessResponsibility,
    hasResponsibleUser
  } = useSingleProcessResponsible(processId);
  
  // Hook para responsabilidade de múltiplos processos
  const {
    processResponsibles,
    setProcessResponsibles,
    fetchMultipleProcessResponsibles
  } = useMultipleProcessResponsibles(processes);
  
  // Funções utilitárias
  const { 
    hasProcessResponsible, 
    isUserProcessResponsible 
  } = useResponsibilityUtilities(processResponsibles);
  
  // Hook para aceitar processos
  const { acceptProcess } = useProcessAccept(processId, singleProcess);
  
  // Função para atualizar os dados de responsabilidade
  const refreshResponsibility = useCallback(async () => {
    if (processId) {
      await fetchSingleProcessResponsibility();
    } else {
      await fetchMultipleProcessResponsibles();
    }
  }, [processId, fetchSingleProcessResponsibility, fetchMultipleProcessResponsibles]);
  
  // Efeito para inicializar os dados
  useEffect(() => {
    refreshResponsibility();
  }, [refreshResponsibility]);
  
  return {
    processResponsibles,
    setProcessResponsibles: processes.length ? setProcessResponsibles : undefined,
    hasProcessResponsible,
    isUserProcessResponsible,
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    refreshResponsibility,
    acceptProcess
  };
};
