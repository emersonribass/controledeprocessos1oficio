
import { useProcessResponsibleAssignment } from "./process-responsibility/useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./process-responsibility/useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./process-responsibility/useProcessResponsibilityVerification";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";

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
  
  // Hook para buscar responsáveis
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibleFetching();

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
    getSectorResponsible
  };
};
