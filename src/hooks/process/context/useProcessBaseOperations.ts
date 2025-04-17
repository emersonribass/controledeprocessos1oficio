
import { Process } from "@/types";
import { useProcessOperations } from "@/hooks/process/useProcessOperations";
import { useProcessHookAdapters } from "./useProcessHookAdapters";

/**
 * Hook para gerenciar as operações básicas de processos
 */
export const useProcessBaseOperations = (refreshProcesses: () => Promise<void>) => {
  // Hook de operações de processos
  const { 
    moveProcessToNextDepartment: moveNext,
    moveProcessToPreviousDepartment: movePrevious,
    startProcess: startProcessBase,
    deleteProcess,
    deleteManyProcesses,
    updateProcessType: updateType,
    updateProcessStatus: updateStatus,
    getProcess
  } = useProcessOperations(() => refreshProcesses());
  
  // Adaptadores para converter retornos de Promise<boolean> para Promise<void>
  const {
    adaptMoveToNext,
    adaptMoveToPrevious,
    adaptStartProcess,
    adaptUpdateType,
    adaptUpdateStatus
  } = useProcessHookAdapters(refreshProcesses);
  
  // Adaptando as funções com os adaptadores
  const moveProcessToNextDepartment = async (processId: string): Promise<void> => {
    await adaptMoveToNext(moveNext, processId);
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<void> => {
    await adaptMoveToPrevious(movePrevious, processId);
  };

  const startProcess = async (processId: string): Promise<void> => {
    await adaptStartProcess(startProcessBase, processId);
  };

  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    await adaptUpdateType(updateType, processId, newTypeId);
  };

  const updateProcessStatus = async (
    processId: string, 
    newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'
  ): Promise<void> => {
    await adaptUpdateStatus(updateStatus, processId, newStatus);
  };

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess,
    updateProcessType,
    updateProcessStatus,
    deleteProcess,
    deleteManyProcesses,
    getProcess
  };
};
