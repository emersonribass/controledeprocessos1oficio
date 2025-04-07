
import { Process } from "@/types";

export const useProcessFilters = (processes: Process[]) => {
  const filterProcesses = (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
    },
    processesToFilter?: Process[]
  ) => {
    // Se for fornecida uma lista personalizada, use-a, caso contrário use a lista padrão
    const listToFilter = processesToFilter || processes;
    
    return listToFilter.filter((process) => {
      // Verificar filtro de departamento
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      // Verificar filtro de status
      if (filters.status) {
        // Converter os valores da UI para o formato usado no tipo Process
        let statusToMatch = filters.status;
        
        // Mapear os valores da UI para os valores internos do tipo Process
        if (filters.status === "pending") {
          statusToMatch = "pending";
        } else if (filters.status === "completed") {
          statusToMatch = "completed";
        } else if (filters.status === "overdue") {
          // Para "overdue", incluímos tanto processos com status overdue quanto com departamentos atrasados
          return process.status === "overdue" || process.isDepartmentOverdue === true;
        } else if (filters.status === "not_started") {
          statusToMatch = "not_started";
        }
        
        // Para status que não são "overdue", fazemos a verificação normal
        if (filters.status !== "overdue" && process.status !== statusToMatch) {
          return false;
        }
      }

      // Verificar filtro de tipo de processo
      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

      // Verificar filtro de busca
      if (
        filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const isProcessOverdue = (process: Process) => {
    // Verificar tanto o prazo geral quanto o prazo do departamento
    return process.status === "overdue" || process.isDepartmentOverdue === true;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};
