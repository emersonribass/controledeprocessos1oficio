
import { useState, useEffect } from "react";
import { useDeadlineVerification } from "./useDeadlineVerification";
import { isAwaitingDocsSection } from "@/utils/departmentUtils";
import { ProcessHistoryService } from "@/utils/processHistoryService";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("DeadlineRenewalCondition");

/**
 * Hook para verificar se um processo pode ter seu prazo renovado.
 * Retorna um objeto com duas propriedades:
 * - canRenewDeadline: booleano que indica se o prazo pode ser renovado
 * - historyId: o ID do histórico que seria renovado, ou undefined se não puder ser renovado
 */
export const useDeadlineRenewalCondition = (process: any) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);

  // Verifica se o processo está atrasado
  const isOverdue = useDeadlineVerification(
    process?.currentDepartment,
    process?.history
  );

  useEffect(() => {
    const checkRenewalCondition = () => {
      // Resetar o estado
      setCanRenewDeadline(false);
      setHistoryId(undefined);

      // Verificações básicas do processo
      if (!process?.id || !process?.currentDepartment) {
        logger.debug(`Processo inválido: ID=${process?.id}, Setor=${process?.currentDepartment}`);
        return;
      }

      // Verifica se está no setor "Aguard. Doc."
      if (!isAwaitingDocsSection(process.currentDepartment)) {
        logger.debug(`Não é setor de Aguardando Documentação: ${process.currentDepartment}`);
        return;
      }

      // Se não estiver atrasado, não pode renovar
      if (!isOverdue) {
        logger.debug(`Processo ${process.id} não está atrasado`);
        return;
      }

      // Busca a entrada mais recente do histórico usando o serviço
      const entradaMaisRecente = ProcessHistoryService.findLatestHistoryEntry(
        process.history,
        process.currentDepartment
      );

      if (!entradaMaisRecente) {
        logger.warn(`Não encontrada entrada no histórico para setor ${process.currentDepartment}`);
        return;
      }

      // Extrai o ID do histórico usando o serviço
      const id = ProcessHistoryService.extractHistoryId(entradaMaisRecente);
      logger.debug(`Processo ${process.id}: Histórico encontrado`, entradaMaisRecente);
      logger.debug(`ID extraído: ${id}, tipo: ${typeof id}`);
      
      // Se há um ID válido, habilitamos a renovação
      if (id !== undefined) {
        setHistoryId(id);
        setCanRenewDeadline(true);
        logger.info(`Renovação habilitada para processo ${process.id}, historyId=${id}`);
      } else {
        logger.warn(`ID indefinido para processo ${process.id}`);
      }
    };

    checkRenewalCondition();
  }, [process, isOverdue]);

  return { canRenewDeadline, historyId };
};
