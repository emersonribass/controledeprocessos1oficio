
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessUpdateHandler");

export const useProcessUpdateHandler = (fetchProcesses: () => Promise<void>) => {
  const { 
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();

  const handleUpdateProcessType = async (processId: string, newTypeId: string) => {
    logger.debug(`Atualizando tipo do processo ${processId} para ${newTypeId}`);
    try {
      const result = await updateProcessType(processId, newTypeId);
      if (result) {
        logger.debug(`Tipo atualizado com sucesso, recarregando processos`);
        await fetchProcesses();
      }
      return result;
    } catch (error) {
      logger.error('Erro ao atualizar tipo de processo:', error);
      throw error;
    }
  };

  const handleUpdateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') => {
    logger.debug(`Atualizando status do processo ${processId} para ${newStatus}`);
    try {
      const result = await updateProcessStatus(processId, newStatus);
      if (result) {
        logger.debug(`Status atualizado com sucesso, recarregando processos`);
        await fetchProcesses();
      }
      return result;
    } catch (error) {
      logger.error('Erro ao atualizar status do processo:', error);
      throw error;
    }
  };

  return {
    updateProcessType: handleUpdateProcessType,
    updateProcessStatus: handleUpdateProcessStatus
  };
};
