
import { useState, useEffect } from "react";
import { useDeadlineVerification } from "./useDeadlineVerification";
import { isAwaitingDocsSection } from "@/utils/departmentUtils";
import { extractHistoryId, findLatestHistoryEntry } from "@/utils/historyUtils";

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
        console.log(`[DeadlineRenewal] Processo inválido: ID=${process?.id}, Setor=${process?.currentDepartment}`);
        return;
      }

      // Verifica se está no setor "Aguard. Doc."
      if (!isAwaitingDocsSection(process.currentDepartment)) {
        console.log(`[DeadlineRenewal] Não é setor de Aguardando Documentação: ${process.currentDepartment}`);
        return;
      }

      // Se não estiver atrasado, não pode renovar
      if (!isOverdue) {
        console.log(`[DeadlineRenewal] Processo ${process.id} não está atrasado`);
        return;
      }

      // Busca a entrada mais recente do histórico
      const entradaMaisRecente = findLatestHistoryEntry(
        process.history,
        process.currentDepartment
      );

      if (!entradaMaisRecente) {
        console.log(`[DeadlineRenewal] Não encontrada entrada no histórico para setor ${process.currentDepartment}`);
        return;
      }

      // Extrai o ID do histórico e fornece detalhes para debug
      const id = extractHistoryId(entradaMaisRecente);
      console.log(`[DeadlineRenewal] Processo ${process.id}: Histórico encontrado`, entradaMaisRecente);
      console.log(`[DeadlineRenewal] ID extraído: ${id}, tipo: ${typeof id}`);
      
      // Se há um ID válido, habilitamos a renovação
      if (id !== undefined) {
        setHistoryId(id);
        setCanRenewDeadline(true);
        console.log(`[DeadlineRenewal] Renovação habilitada para processo ${process.id}, historyId=${id}`);
      } else {
        console.log(`[DeadlineRenewal] ID indefinido para processo ${process.id}`);
      }
    };

    checkRenewalCondition();
  }, [process, isOverdue]);

  return { canRenewDeadline, historyId };
};
