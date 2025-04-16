
import { Process } from "@/types";

/**
 * Interface para filtros de processos
 */
export interface ProcessFilters {
  department?: string;
  status?: string;
  processType?: string;
  search?: string;
  excludeCompleted?: boolean;
}

/**
 * Filtra processos com base nos critérios fornecidos
 * @param processes Lista de processos a serem filtrados
 * @param filters Critérios de filtro
 * @returns Lista filtrada de processos
 */
export const filterProcessesByFilters = (processes: Process[], filters: ProcessFilters): Process[] => {
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
 * Interface para critérios de ordenação de processos
 */
export interface ProcessSortCriteria {
  field: keyof Process;
  direction: "asc" | "desc";
}

/**
 * Ordena uma lista de processos com base nos critérios fornecidos
 * @param processes Lista de processos a serem ordenados
 * @param criteria Critérios de ordenação
 * @returns Lista ordenada de processos
 */
export const sortProcesses = (processes: Process[], criteria: ProcessSortCriteria): Process[] => {
  return [...processes].sort((a, b) => {
    const aValue = a[criteria.field];
    const bValue = b[criteria.field];
    
    let comparison = 0;
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      // Fallback para comparação genérica
      comparison = String(aValue).localeCompare(String(bValue));
    }
    
    return criteria.direction === 'asc' ? comparison : -comparison;
  });
};
