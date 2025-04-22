
import { ProcessResponsibility } from "./types";
import { useProcessResponsibleAssignment } from "./useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./useProcessResponsibilityVerification";
import { useResponsibleBatchLoader } from "./useResponsibleBatchLoader";

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
    getProcessResponsible: loadResponsible,
    getSectorResponsible: loadResponsible,
    preloadResponsibles
  };
};
