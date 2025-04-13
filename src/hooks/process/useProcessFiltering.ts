import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";

/**
 * Hook para filtrar processos com base em critérios específicos
 */
export const useProcessFiltering = (processes: Process[]) => {
  const { user, isAdmin } = useAuth();

  const filterProcesses = useMemo(() => (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    },
    processesToFilter?: Process[],
    processesResponsibles?: Record<string, any>
  ) => {
    const baseList = processesToFilter || processes;

    // Aplica filtro de visibilidade (usuário responsável ou admin)
    const visibleProcesses = baseList.filter((process) => {
      if (user && !isAdmin(user.email)) {
        const isUserResponsibleForProcess = process.responsibleUserId === user.id;
        const isUserResponsibleForCurrentSector =
          processesResponsibles?.[process.id]?.[process.currentDepartment]?.usuario_id === user.id;

        return isUserResponsibleForProcess || isUserResponsibleForCurrentSector;
      }
      return true; // Admins veem tudo
    });

    // Aplica os demais filtros
    return visibleProcesses.filter((process) => {
      if (filters.excludeCompleted && process.status === 'completed') {
        return false;
      }

      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      if (filters.status) {
        const statusMap: Record<string, string> = {
          pending: "pending",
          completed: "completed",
          overdue: "overdue",
          not_started: "not_started",
        };
        if (process.status !== statusMap[filters.status]) {
          return false;
        }
      }

      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

      if (
        filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [processes, user, isAdmin]);

  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};