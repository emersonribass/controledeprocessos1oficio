
import { Process, PROCESS_STATUS } from "@/types";
import { useAuth } from "@/hooks/auth";

export const useProcessFilters = (processes: Process[]) => {
  const { user, isAdmin } = useAuth();
  
  const filterProcesses = (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      showCompleted?: boolean;
    },
    processesToFilter?: Process[]
  ) => {
    // Se for fornecida uma lista personalizada, use-a, caso contrário use a lista padrão
    const listToFilter = processesToFilter || processes;
    
    return listToFilter.filter((process) => {
      // Verificar se o usuário tem permissão para ver este processo
      if (user && !isAdmin(user.email) && user.departments?.length > 0) {
        // Para processos não iniciados, verificar o primeiro setor da sequência
        if (process.status === PROCESS_STATUS.NOT_STARTED) {
          // Verificar se o usuário tem acesso ao primeiro setor (Atendimento)
          const firstDepartmentId = "1"; // ID do primeiro setor (Atendimento)
          if (!user.departments.includes(firstDepartmentId)) {
            return false; // Não mostrar processos não iniciados se o usuário não tiver acesso ao primeiro setor
          }
        } 
        // Para processos em andamento ou em outros estados, verificar o setor atual
        else if (!user.departments.includes(process.currentDepartment)) {
          return false; // Não mostrar se o usuário não tem acesso ao setor atual
        }
      }

      // Ocultar processos concluídos se showCompleted for false
      if (filters.showCompleted === false && process.status === PROCESS_STATUS.COMPLETED) {
        return false;
      }

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
          statusToMatch = PROCESS_STATUS.PENDING;
        } else if (filters.status === "completed") {
          statusToMatch = PROCESS_STATUS.COMPLETED;
        } else if (filters.status === "overdue") {
          statusToMatch = PROCESS_STATUS.OVERDUE;
        } else if (filters.status === "not_started") {
          statusToMatch = PROCESS_STATUS.NOT_STARTED;
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

      // Verificar filtro de busca - melhorado para ser mais flexível
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
    if (process.status === PROCESS_STATUS.OVERDUE) {
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
