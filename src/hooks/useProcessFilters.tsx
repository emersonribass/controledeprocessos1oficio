
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
          statusToMatch = "overdue";
        } else if (filters.status === "not_started") {
          statusToMatch = "not_started";
        }
        
        // Garantir que o status corresponda exatamente ao solicitado
        if (process.status !== statusToMatch) {
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

  // A função isProcessOverdue agora deve verificar a data limite do departamento atual
  // além da data limite geral do processo
  const isProcessOverdue = (process: Process) => {
    // Se o status já foi determinado como 'overdue', respeitar essa decisão
    if (process.status === 'overdue') {
      return true;
    }
    
    // Caso contrário, verificar a data fim esperada
    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};
