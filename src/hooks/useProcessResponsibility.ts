
import { useProcessResponsibleAssignment } from "./process-responsibility/useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./process-responsibility/useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./process-responsibility/useProcessResponsibilityVerification";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";

export const useProcessResponsibility = () => {
  const { isAssigning, assignResponsible } = useProcessResponsibleAssignment();
  const { isAccepting, acceptProcessResponsibility } = useProcessResponsibilityAcceptance();
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcessResponsibilityVerification();
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibleFetching();

  return {
    // Estado
    isAssigning,
    isAccepting,
    
    // Funções de atribuição
    assignResponsible,
    acceptProcessResponsibility,
    
    // Funções de verificação
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    
    // Funções de busca
    getProcessResponsible,
    getSectorResponsible
  };
};
