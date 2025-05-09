
import { useProcessUpdate } from "@/hooks/useProcessUpdate";

export const useProcessUpdateHandler = (fetchProcesses: () => Promise<void>) => {
  const { 
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();

  const handleUpdateProcessType = async (processId: string, newTypeId: string) => {
    try {
      await updateProcessType(processId, newTypeId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      throw error;
    }
  };

  const handleUpdateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') => {
    try {
      await updateProcessStatus(processId, newStatus);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar status do processo:', error);
      throw error;
    }
  };

  return {
    updateProcessType: handleUpdateProcessType,
    updateProcessStatus: handleUpdateProcessStatus
  };
};
