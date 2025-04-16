
import { useProcessResponsibleAssignment } from "./process-responsibility/useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./process-responsibility/useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./process-responsibility/useProcessResponsibilityVerification";
import { useProcessResponsibleFetching } from "./process-responsibility/useProcessResponsibleFetching";
import { useProcessResponsibleBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

/**
 * Hook unificado para gerenciar responsabilidade em processos
 * Agora incluindo suporte para carregamento em lote
 */
export const useProcessResponsibility = () => {
  // Hook para atribuir responsáveis
  const { isAssigning, assignResponsible } = useProcessResponsibleAssignment();
  
  // Hook para aceitar responsabilidade
  const { isAccepting, acceptProcessResponsibility } = useProcessResponsibilityAcceptance();
  
  // Hook para verificar responsabilidade
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcessResponsibilityVerification();
  
  // Hook para buscar responsáveis
  const { getProcessResponsible, getSectorResponsible, clearCache } = useProcessResponsibleFetching();
  
  // Hook para carregamento em lote
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibleBatchLoader();

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
    
    // Busca individual
    getProcessResponsible,
    getSectorResponsible,
    
    // Busca em lote
    loadProcessResponsibleBatch,
    loadSectorResponsibleBatch,
    
    // Limpeza de cache
    clearCache
  };
};
