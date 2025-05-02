
import { useProcessResponsibleAssignment } from "./process-responsibility/useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./process-responsibility/useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./process-responsibility/useProcessResponsibilityVerification";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";
import { useProcesses } from "@/hooks/process/useProcessContext";
import { Process } from "@/types";
import { useProcessPermissionCheckers } from "./process/permission/useProcessPermissionCheckers";

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
    isUserInAttendanceSector, 
    isUserInCurrentSector,
    hasSectorResponsible
  } = useProcesses();

  // Importando o hook de permissões diretamente para obter isUserProcessOwner
  const { isUserProcessOwner } = useProcessPermissionCheckers();
  
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
    isUserProcessOwner,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible,
    
    // Busca
    getProcessResponsible,
    getSectorResponsible
  };
};
