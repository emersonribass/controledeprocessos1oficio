
import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { isDepartmentOverdue } from "@/utils/processDeadlines";

export const useDeadlineVerification = (
  currentDepartment: string | undefined,
  history: any[] | undefined
) => {
  const [isOverdue, setIsOverdue] = useState(false);
  const { getSetorById } = useSupabase();

  useEffect(() => {
    const checkDeadline = async () => {
      if (!currentDepartment || !history) {
        setIsOverdue(false);
        return;
      }

      try {
        const { data: setor, error } = await getSetorById(currentDepartment);
        
        if (error || !setor) {
          setIsOverdue(false);
          return;
        }

        const timeLimit = setor.time_limit ?? null;
        
        // Usa a função isDepartmentOverdue que agora considera dias úteis
        const atrasadoNoSetor = isDepartmentOverdue({
          history,
          currentDepartment,
          departmentTimeLimit: timeLimit,
        });

        setIsOverdue(atrasadoNoSetor);
      } catch (err) {
        console.error('[DeadlineVerification] Erro ao verificar prazo:', err);
        setIsOverdue(false);
      }
    };

    checkDeadline();
  }, [currentDepartment, history]);

  return isOverdue;
};
