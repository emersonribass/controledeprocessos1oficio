
import { useProcessResponsibleAssignment } from "./useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./useProcessResponsibilityVerification";
import { useResponsibleBatchLoader } from "./useResponsibleBatchLoader";

/**
 * Hook unificado para gerenciar responsabilidade em processos
 */
export const useProcessResponsibility = () => {
  // Hook para atribuir responsáveis
  const { isAssigning, assignResponsible } = useProcessResponsibleAssignment();
  
  // Hook para aceitar responsabilidade
  const { isAccepting, acceptProcessResponsibility } = useProcessResponsibilityAcceptance();
  
  // Hook para verificar responsabilidade
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcessResponsibilityVerification();
  
  // Hook para carregar responsáveis
  const { loadResponsible: getProcessResponsible, preloadResponsibles } = useResponsibleBatchLoader();

  // Função para buscar responsável do setor - mantida para compatibilidade
  const getSectorResponsible = getProcessResponsible;

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
    
    // Busca
    getProcessResponsible,
    getSectorResponsible,
    preloadResponsibles
  };
};

