
import { Process } from "@/types";

/**
 * Hook para filtrar processos por status e outros critérios
 */
export const useProcessStatusFilters = () => {
  /**
   * Filtra processos com base em critérios selecionados pelo usuário, inclusive data de entrada
   */
  const applyUserFilters = (
    processes: Process[],
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
      startDate?: string;
      endDate?: string;
      responsibleUser?: string;
    },
    processesResponsibles?: Record<string, any>
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
          archived: "archived",
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

      // Filtro por período de startDate
      if (filters.startDate) {
        const start = new Date(filters.startDate);
        const processStartDate = process.startDate ? new Date(process.startDate) : null;
        if (!processStartDate || processStartDate < start) {
          return false;
        }
      }
      if (filters.endDate) {
        const end = new Date(filters.endDate);
        const processStartDate = process.startDate ? new Date(process.startDate) : null;
        if (!processStartDate || processStartDate > end) {
          return false;
        }
      }

      // Filtro por responsável - corrigido para verificar tanto responsável direto quanto responsáveis por setor
      if (filters.responsibleUser) {
        const isResponsibleUser = process.responsibleUserId === filters.responsibleUser;
        
        // Verificar se é responsável em algum setor
        let isResponsibleInAnySector = false;
        if (processesResponsibles && processesResponsibles[process.id]) {
          const processSectorResponsibles = processesResponsibles[process.id];
          isResponsibleInAnySector = Object.values(processSectorResponsibles).some(
            (sectorData: any) => sectorData && sectorData.usuario_id === filters.responsibleUser
          );
        }
        
        if (!isResponsibleUser && !isResponsibleInAnySector) {
          return false;
        }
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
