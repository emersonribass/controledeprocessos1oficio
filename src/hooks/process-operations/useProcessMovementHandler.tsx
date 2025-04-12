
import { Process } from "@/types";

export const useProcessMovementHandler = (
  moveToNext: (processId: string) => Promise<boolean>,
  moveToPrevious: (processId: string) => Promise<boolean>,
  startProcessMovement: (processId: string) => Promise<boolean>,
  fetchProcesses: () => Promise<void>
) => {
  const handleMoveProcessToNextDepartment = async (processId: string) => {
    await moveToNext(processId);
    await fetchProcesses();
  };

  const handleMoveProcessToPreviousDepartment = async (processId: string) => {
    await moveToPrevious(processId);
    await fetchProcesses();
  };
  
  const startProcess = async (processId: string) => {
    try {
      await startProcessMovement(processId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      throw error;
    }
  };

  return {
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    startProcess
  };
};
