
import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToastService } from "@/utils/toastUtils";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("DeadlineRenewal");

export const useProcessDeadlineRenewal = (onRenewalComplete?: () => void) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const { updateProcessoHistorico } = useSupabase();
  const toast = useToastService();

  const renewDeadline = async (processId: string, historyId: number) => {
    if (!historyId || isNaN(historyId)) {
      logger.error("ID do histórico inválido:", historyId);
      toast.error(
        "Erro ao renovar prazo",
        "ID do histórico inválido. Contate o suporte."
      );
      return;
    }

    logger.info(`Iniciando renovação para processo ${processId}, historyId=${historyId}`);
    setIsRenewing(true);
    
    try {
      const now = new Date().toISOString();
      logger.debug(`Atualizando data_entrada para ${now}`);
      
      const { error, data } = await updateProcessoHistorico(historyId, {
        data_entrada: now
      });

      if (error) {
        logger.error("Erro retornado pela API:", error);
        throw error;
      }

      logger.info(`Renovação concluída com sucesso para historyId=${historyId}`, data);
      
      toast.success(
        "Prazo renovado com sucesso",
        "A data de entrada do processo foi atualizada."
      );

      if (onRenewalComplete) {
        logger.debug("Chamando callback de conclusão");
        onRenewalComplete();
      }
    } catch (error) {
      logger.error("Erro ao renovar prazo:", error);
      
      toast.error(
        "Erro ao renovar prazo",
        "Não foi possível renovar o prazo do processo."
      );
    } finally {
      setIsRenewing(false);
    }
  };

  return {
    renewDeadline,
    isRenewing
  };
};
