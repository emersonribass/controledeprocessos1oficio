
import { ProcessResponsibility } from "./types";
import { useProcessResponsibleAssignment } from "./useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./useProcessResponsibilityVerification";
import { useResponsibleBatchLoader } from "./useResponsibleBatchLoader";
import { useCallback } from "react";

/**
 * Hook unificado para gerenciar responsabilidade em processos
 * @returns {ProcessResponsibility} Interface unificada para gerenciamento de responsabilidade
 */
export const useProcessResponsibility = (): ProcessResponsibility => {
  // Hook para atribuição de responsáveis
  const { isAssigning, assignResponsible } = useProcessResponsibleAssignment();
  
  // Hook para aceitação de responsabilidade
  const { isAccepting, acceptProcessResponsibility } = useProcessResponsibilityAcceptance();
  
  // Hook para verificação de responsabilidade
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcessResponsibilityVerification();
  
  // Hook para carregamento otimizado de responsáveis
  const { loadResponsible, preloadResponsibles } = useResponsibleBatchLoader();

  // Adaptar a função loadResponsible para satisfazer a interface ProcessResponsibleFetching
  const getProcessResponsible = useCallback(async (processId: string) => {
    return loadResponsible(processId, ''); // Passamos um setor vazio para processo
  }, [loadResponsible]);

  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    return loadResponsible(processId, sectorId);
  }, [loadResponsible]);

  return {
    // Estados
    isAssigning,
    isAccepting,
    
    // Atribuição
    assignResponsible,
    
    // Aceitação
    acceptProcessResponsibility,
    
    // Verificação
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    
    // Busca de responsáveis
    getProcessResponsible,
    getSectorResponsible,
    preloadResponsibles
  };
};
