
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessDelete } from "@/hooks/process-operations/useProcessDelete";
import { useProcessMovementHandler } from "@/hooks/process-operations/useProcessMovementHandler";
import { useProcessUpdateHandler } from "@/hooks/process-operations/useProcessUpdateHandler";
import { useAuth } from "@/hooks/auth";

export const useSupabaseProcesses = () => {
  const { 
    processes, 
    isLoading, 
    fetchProcesses 
  } = useProcessesFetch();
  
  const { 
    moveProcessToNextDepartment: moveToNext, 
    moveProcessToPreviousDepartment: moveToPrevious,
    startProcess: startProcessMovement
  } = useProcessMovement(() => {
    fetchProcesses();
  });
  
  // Hook para lidar com operações de movimentação de processos
  const movementHandler = useProcessMovementHandler(
    moveToNext,
    moveToPrevious,
    startProcessMovement,
    fetchProcesses
  );
  
  // Hook para lidar com operações de atualização de processos
  const updateHandler = useProcessUpdateHandler(fetchProcesses);
  
  // Hook para lidar com operações de exclusão de processos
  const { deleteProcess, deleteManyProcesses } = useProcessDelete(fetchProcesses);
  
  const { departments } = useDepartmentsData();
  const { user } = useAuth();

  return {
    processes,
    isLoading,
    fetchProcesses,
    ...movementHandler,
    ...updateHandler,
    deleteProcess,
    deleteManyProcesses
  };
};
