
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";

export const useProcessFilters = (processes: Process[]) => {
  const { user, isAdmin } = useAuth();
  
  const filterProcesses = (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    },
    processesToFilter?: Process[]
  ) => {
    // Se for fornecida uma lista personalizada, use-a, caso contrário use a lista padrão
    const listToFilter = processesToFilter || processes;
    
    return listToFilter.filter((process) => {
      // Excluir processos concluídos se o filtro excludeCompleted estiver ativo
      if (filters.excludeCompleted && process.status === 'completed') {
        return false;
      }

      // Verificar se o usuário tem permissão para ver este processo
      // Administradores podem ver todos os processos
      if (user && user.email && isAdmin(user.email)) {
        // Administrador pode ver tudo, apenas aplica os filtros específicos
      } else if (user && !isAdmin(user.email) && user.departments?.length > 0) {
        // Para processos não iniciados, apenas usuários do setor 1 (Atendimento) podem ver
        if (process.status === 'not_started') {
          // Se o usuário não tem o setor 1 em seus setores atribuídos, não mostrar
          if (!user.departments.includes('1')) {
            return false;
          }
        } 
        // Para processos em andamento, só mostrar se o usuário pertence ao departamento atual
        else if (!user.departments.includes(process.currentDepartment)) {
          return false;
        }
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
