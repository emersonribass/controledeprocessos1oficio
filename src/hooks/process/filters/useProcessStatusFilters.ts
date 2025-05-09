
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
      startDate?: string;
      endDate?: string;
      responsibleUser?: string;
    },
    processesResponsibles?: Record<string, any>
  ): Process[] => {
    return processes.filter((process) => {
      // Se excludeCompleted está ativo, filtrar processos concluídos
      if (filters.excludeCompleted && process.status === 'completed') {
        return false;
      }

      // Filtrar por departamento se especificado
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      // Filtrar por status apenas se um status específico foi selecionado
      if (filters.status && filters.status !== "all") {
        if (process.status !== filters.status) {
          return false;
        }
      }

      // Filtrar por tipo de processo
      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

      // Filtrar por número de protocolo
      if (filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      // Filtrar por período
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

      // Filtrar por responsável
      if (filters.responsibleUser) {
        const isResponsibleUser = process.responsibleUserId === filters.responsibleUser;
        
        // Verificar responsabilidade em qualquer setor
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
