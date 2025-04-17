
import { Process } from "@/types";

/**
 * Hook para filtrar processos por status e outros critérios
 */
export const useProcessStatusFilters = () => {
  /**
   * Filtra processos com base em critérios selecionados pelo usuário
   */
  const applyUserFilters = (
    processes: Process[],
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    }
  ): Process[] => {
    return processes.filter((process) => {
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

      if (filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  /**
   * Verifica se um processo está atrasado
   */
  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    applyUserFilters,
    isProcessOverdue
  };
};
