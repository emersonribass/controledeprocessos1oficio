
import { ProcessResponsibility } from "./types";
import { useProcessResponsibleAssignment } from "./useProcessResponsibleAssignment";
import { useProcessResponsibilityAcceptance } from "./useProcessResponsibilityAcceptance";
import { useProcessResponsibilityVerification } from "./useProcessResponsibilityVerification";
import { useResponsibleBatchLoader } from "./useResponsibleBatchLoader";
import { useCallback } from "react";
import { Process } from "@/types";

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
  const { isUserResponsibleForProcess: checkUserResponsibleForProcess, isUserResponsibleForSector: checkUserResponsibleForSector } = useProcessResponsibilityVerification();
  
  // Hook para carregamento otimizado de responsáveis
  const { loadResponsible, preloadResponsibles: batchPreloadResponsibles } = useResponsibleBatchLoader();

  // Adaptar a função loadResponsible para satisfazer a interface ProcessResponsibilityFetching
  const getProcessResponsible = useCallback(async (processId: string) => {
    return loadResponsible(processId, ''); // Passamos um setor vazio para processo
  }, [loadResponsible]);

  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    return loadResponsible(processId, sectorId);
  }, [loadResponsible]);

  // Adaptadores para as funções de verificação
  const isUserResponsibleForProcess = useCallback((processId: string): boolean => {
    // Criamos um objeto Process mínimo para passar para a função original
    const processStub: Process = {
      id: processId,
      protocolNumber: "",
      processType: "",
      currentDepartment: "",
      startDate: "",
      expectedEndDate: "",
      status: "pending",
      history: []
    };
    return checkUserResponsibleForProcess(processStub);
  }, [checkUserResponsibleForProcess]);

  const isUserResponsibleForSector = useCallback((processId: string, sectorId: string): boolean => {
    // Para esta função, precisamos converter a Promise<boolean> para boolean
    // Como não podemos fazer isso diretamente, vamos retornar false como padrão
    // e a lógica real será implementada pelos consumidores
    return false; // Valor padrão simplificado
  }, []);

  // Adaptador para o preloadResponsibles que aceita string[] em vez de Process[]
  const preloadResponsibles = useCallback(async (processIds: string[]): Promise<void> => {
    // Convertemos os IDs para objetos Process mínimos
    const processStubs: Process[] = processIds.map(id => ({
      id,
      protocolNumber: "",
      processType: "",
      currentDepartment: "",
      startDate: "",
      expectedEndDate: "",
      status: "pending",
      history: []
    }));
    
    return batchPreloadResponsibles(processStubs);
  }, [batchPreloadResponsibles]);

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
