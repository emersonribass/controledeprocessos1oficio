
import { useState, useEffect } from "react";
import { useDeadlineVerification } from "./useDeadlineVerification";
import { isAwaitingDocsSection } from "@/utils/departmentUtils";
import { extractHistoryId, findLatestHistoryEntry } from "@/utils/historyUtils";

/**
 * Hook para verificar se um processo pode ter seu prazo renovado.
 */
export const useDeadlineRenewalCondition = (process: any) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);

  const isOverdue = useDeadlineVerification(
    process?.currentDepartment,
    process?.history
  );

  useEffect(() => {
    const checkRenewalCondition = () => {
      if (!process?.id || !process?.currentDepartment) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        return;
      }

      // Verifica se está no setor "Aguard. Doc."
      if (!isAwaitingDocsSection(process.currentDepartment)) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        return;
      }

      // Se não estiver atrasado, não pode renovar
      if (!isOverdue) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        return;
      }

      // Busca a entrada mais recente do histórico
      const entradaMaisRecente = findLatestHistoryEntry(
        process.history,
        process.currentDepartment
      );

      if (!entradaMaisRecente) {
        setCanRenewDeadline(false);
        setHistoryId(undefined);
        return;
      }

      // Extrai o ID do histórico
      const id = extractHistoryId(entradaMaisRecente);
      
      setHistoryId(id);
      setCanRenewDeadline(id !== undefined);
    };

    checkRenewalCondition();
  }, [process, isOverdue]);

  return { canRenewDeadline, historyId };
};

