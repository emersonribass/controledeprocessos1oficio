
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessDelete } from "@/hooks/process-management/useProcessDelete";
import { useProcessStart } from "@/hooks/process-management/useProcessStart";

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
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();

  const {
    deleteProcess,
    deleteManyProcesses
  } = useProcessDelete();

  const {
    startProcess
  } = useProcessStart();
  
  const { departments } = useDepartmentsData();

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

  const handleUpdateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => {
    try {
      await updateProcessStatus(processId, newStatus);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar status do processo:', error);
      throw error;
    }
  };

  const handleStartProcess = async (processId: string) => {
    try {
      await startProcess(processId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      throw error;
    }
  };

  const handleDeleteProcess = async (processId: string) => {
    const success = await deleteProcess(processId);
    if (success) {
      await fetchProcesses();
    }
    return success;
  };

  const handleDeleteManyProcesses = async (processIds: string[]) => {
    const success = await deleteManyProcesses(processIds);
    if (success) {
      await fetchProcesses();
    }
    return success;
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    updateProcessType: handleUpdateProcessType,
    updateProcessStatus: handleUpdateProcessStatus,
    startProcess: handleStartProcess,
    deleteProcess: handleDeleteProcess,
    deleteManyProcesses: handleDeleteManyProcesses
  };
};
