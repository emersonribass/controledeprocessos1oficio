
import { Process } from "@/types";
import { useCallback } from "react";

export const useProcessMovementHandler = (
  moveToNext: (processId: string) => Promise<boolean>,
  moveToPrevious: (processId: string) => Promise<boolean>,
  startProcessMovement: (processId: string) => Promise<boolean>,
  fetchProcesses: () => Promise<void>
) => {
  const handleMoveProcessToNextDepartment = useCallback(async (processId: string): Promise<void> => {
    try {
      await moveToNext(processId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao mover processo para o próximo departamento:', error);
    }
  }, [moveToNext, fetchProcesses]);

  const handleMoveProcessToPreviousDepartment = useCallback(async (processId: string): Promise<void> => {
    try {
      await moveToPrevious(processId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao mover processo para o departamento anterior:', error);
    }
  }, [moveToPrevious, fetchProcesses]);
  
  const startProcess = useCallback(async (processId: string): Promise<void> => {
    try {
      await startProcessMovement(processId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
    }
  }, [startProcessMovement, fetchProcesses]);

  return {
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    startProcess
  };
};
