
import { useProcessResponsibleAssignment } from "./process-responsibility/useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./process-responsibility/useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./process-responsibility/useProcessResponsibilityVerification";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";
import { useProcesses } from "./process/useProcessContext";
import { Process } from "@/types";

/**
 * Hook unificado para gerenciar responsabilidade em processos
 * Mantido para compatibilidade, mas com implementação revisada para evitar duplicação
 */
export const useProcessResponsibility = () => {
  // Hook para atribuir responsáveis
  const { isAssigning, assignResponsible } = useProcessResponsibleAssignment();
  
  // Hook para aceitar responsabilidade
  const { isAccepting, acceptProcessResponsibility } = useProcessResponsibilityAcceptance();
  
  // Hook para verificar responsabilidade - agora estamos apenas reexportando 
  // estas funções do hook useProcessFiltering via useProcesses
  const { 
    isUserResponsibleForProcess, 
    isUserResponsibleForSector, 
    isUserInAttendanceSector, 
    isUserInCurrentSector,
    hasSectorResponsible
  } = useProcesses();
  
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
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible,
    
    // Busca
    getProcessResponsible,
    getSectorResponsible
  };
};
