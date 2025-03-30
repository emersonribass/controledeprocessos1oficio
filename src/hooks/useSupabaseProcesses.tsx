
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";

export const useSupabaseProcesses = () => {
  const { 
    processes, 
    isLoading, 
    fetchProcesses 
  } = useProcessesFetch();
  
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment 
  } = useProcessMovement(processes);
  
  const { 
    updateProcessType 
  } = useProcessUpdate();

  // Este hook agora orquestra os hooks específicos
  const handleMoveProcessToNextDepartment = async (processId: string) => {
    const success = await moveProcessToNextDepartment(processId);
    if (success) {
      await fetchProcesses();
    }
  };

  const handleMoveProcessToPreviousDepartment = async (processId: string) => {
    const success = await moveProcessToPreviousDepartment(processId);
    if (success) {
      await fetchProcesses();
    }
  };

  const handleUpdateProcessType = async (processId: string, newTypeId: string) => {
    try {
      await updateProcessType(processId, newTypeId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      throw error;
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    updateProcessType: handleUpdateProcessType
  };
};
