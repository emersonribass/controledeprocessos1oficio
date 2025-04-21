
import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { isDepartmentOverdue } from "@/utils/processDeadlines";

/**
 * Hook para verificar se um processo pode ter seu prazo renovado.
 * Este hook é usado exclusivamente na tela de detalhes do processo.
 */
export const useDeadlineRenewalCondition = (
  process: any // Agora recebe o processo inteiro ao invés de campos quebrados
) => {
  const [canRenewDeadline, setCanRenewDeadline] = useState(false);
  const [historyId, setHistoryId] = useState<number | undefined>(undefined);
  const { getSetorById } = useSupabase();

  useEffect(() => {
    const checkRenewalCondition = async () => {
      // Setor "Aguard. Doc." tem ID 2 no sistema
      if (!process?.id || !process?.currentDepartment) {
        setCanRenewDeadline(false);
        return;
      }

      const isAwaitingDocs = process.currentDepartment === "2";
      if (!isAwaitingDocs) {
        setCanRenewDeadline(false);
        return;
      }

      // Buscar tempo limite do setor atual
      try {
        const { data: setor, error } = await getSetorById(process.currentDepartment);
        if (error || !setor) {
          setCanRenewDeadline(false);
          return;
        }

        // Usa utilitário para checar atraso REAL do setor atual, não só status "overdue"
        const atrasadoNoSetor = isDepartmentOverdue({
          history: process.history,
          currentDepartment: process.currentDepartment,
          departmentTimeLimit: setor.time_limit,
        });

        if (!atrasadoNoSetor) {
          setCanRenewDeadline(false);
          return;
        }

        // Buscar a entrada atual no histórico desse departamento
        const entries = process.history
          .filter((h: any) => h.departmentId === process.currentDepartment && h.exitDate === null)
          .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
        const entradaMaisRecente = entries[0];

        if (entradaMaisRecente) {
          setHistoryId(entradaMaisRecente.id || undefined); // id pode não existir, depende do mapeamento
          setCanRenewDeadline(true);
        } else {
          setCanRenewDeadline(false);
        }
      } catch (err) {
        setCanRenewDeadline(false);
      }
    };

    checkRenewalCondition();
  }, [process]);

  return { canRenewDeadline, historyId };
};
