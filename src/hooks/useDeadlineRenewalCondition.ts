
import { useState, useEffect } from "react";
import { useDeadlineVerification } from "./useDeadlineVerification";
import { isAwaitingDocsSection } from "@/utils/departmentUtils";
import { ProcessHistoryService } from "@/utils/processHistoryService";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("DeadlineRenewalCondition");

/**
 * Hook que verifica se um processo pode ter seu prazo renovado.
 * 
 * Condições principais:
 * 1. Processo deve estar no setor "Aguardando Documentação"
 * 2. Processo deve estar com o prazo vencido
 * 
 * @returns Objeto contendo:
 *   - canRenewDeadline: se o prazo pode ser renovado
 *   - historyId: o ID do histórico para renovação
 */
export const useDeadlineRenewalCondition = (process: any) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);

  // Verifica se o processo está atrasado (CONDIÇÃO 2)
  const isOverdue = useDeadlineVerification(
    process?.currentDepartment,
    process?.history
  );

  useEffect(() => {
    // Resetar o estado no início de cada verificação
    setCanRenewDeadline(false);
    setHistoryId(undefined);

    // Verificações básicas do processo
    if (!process?.id || !process?.currentDepartment) {
      logger.debug(`Processo inválido ou incompleto: ID=${process?.id}, Setor=${process?.currentDepartment}`);
      return;
    }

    // CONDIÇÃO 1: Verificar se está no setor "Aguardando Documentação"
    const isAwaitingDocs = isAwaitingDocsSection(process.currentDepartment);
    logger.debug(`Setor é "Aguard. Doc."? ${isAwaitingDocs} (id=${process.currentDepartment})`);
    
    if (!isAwaitingDocs) {
      logger.debug(`Processo ${process.id} não está no setor de Aguardando Documentação`);
      return;
    }

    // CONDIÇÃO 2: Verificar se está atrasado
    logger.debug(`Processo ${process.id} está atrasado? ${isOverdue}`);
    if (!isOverdue) {
      logger.debug(`Processo ${process.id} não está atrasado`);
      return;
    }

    // As condições principais foram satisfeitas, agora precisamos encontrar o historyId

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
    
    if (id !== undefined) {
      setHistoryId(id);
      setCanRenewDeadline(true);
      logger.info(`Renovação habilitada para processo ${process.id}, historyId=${id}`);
    } else {
      logger.warn(`ID indefinido para processo ${process.id}, não será possível renovar o prazo`);
    }
  }, [process, isOverdue]);

  return { canRenewDeadline, historyId };
};
