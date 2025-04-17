
/**
 * Hook com adaptadores para converter Promise<boolean> para Promise<void>
 * para manter compatibilidade com a API do contexto
 */
export const useProcessHookAdapters = (refreshProcesses: () => Promise<void>) => {
  // Adaptador para moveToNext
  const adaptMoveToNext = async (
    moveNext: (processId: string) => Promise<boolean>,
    processId: string
  ): Promise<void> => {
    await moveNext(processId);
    await refreshProcesses();
  };

  // Adaptador para moveToPrevious
  const adaptMoveToPrevious = async (
    movePrevious: (processId: string) => Promise<boolean>,
    processId: string
  ): Promise<void> => {
    await movePrevious(processId);
    await refreshProcesses();
  };

  // Adaptador para startProcess
  const adaptStartProcess = async (
    startProcessBase: (processId: string) => Promise<boolean>,
    processId: string
  ): Promise<void> => {
    await startProcessBase(processId);
    await refreshProcesses();
  };

  // Adaptador para updateProcessType
  const adaptUpdateType = async (
    updateType: (processId: string, newTypeId: string) => Promise<boolean>,
    processId: string,
    newTypeId: string
  ): Promise<void> => {
    await updateType(processId, newTypeId);
    await refreshProcesses();
  };

  // Adaptador para updateProcessStatus
  const adaptUpdateStatus = async (
    updateStatus: (processId: string, newStatus: string) => Promise<boolean>,
    processId: string,
    newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'
  ): Promise<void> => {
    await updateStatus(processId, newStatus);
    await refreshProcesses();
  };

  return {
    adaptMoveToNext,
    adaptMoveToPrevious,
    adaptStartProcess,
    adaptUpdateType,
    adaptUpdateStatus
  };
};
