
import { useProcessMoveNext } from "./process-movement/useProcessMoveNext";
import { useProcessMovePrevious } from "./process-movement/useProcessMovePrevious";
import { useStartProcess } from "./process-movement/useStartProcess";
import { useProcessDelete } from "./process-movement/useProcessDelete";

export const useProcessMovement = (onProcessUpdated: () => void) => {
  const { moveProcessToNextDepartment, isMoving: isMovingNext } = useProcessMoveNext(onProcessUpdated);
  const { moveProcessToPreviousDepartment, isMoving: isMovingPrev } = useProcessMovePrevious(onProcessUpdated);
  const { startProcess, isStarting } = useStartProcess(onProcessUpdated);
  const { deleteProcess, deleteManyProcesses } = useProcessDelete(onProcessUpdated);

  // Consolidamos o estado isMoving
  const isMoving = isMovingNext || isMovingPrev;

  return {
    // Estados
    isMoving,
    isStarting,
    
    // Funções de movimentação de processos
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess,
    
    // Funções de exclusão
    deleteProcess,
    deleteManyProcesses
  };
};
