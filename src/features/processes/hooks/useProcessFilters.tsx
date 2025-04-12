
import { Process, PROCESS_STATUS } from "@/types";
import { useAuth } from "@/features/auth";
import { ProcessFilters } from "../types";
import { useProcessFilterByStatus } from "./useProcessFilterByStatus";

export const useProcessFilters = (processes: Process[]) => {
  const { user, isAdmin } = useAuth();
  const { filterByStatus } = useProcessFilterByStatus();
  
  const filterProcesses = (
    filters: ProcessFilters,
    processesToFilter?: Process[]
  ) => {
    // Se for fornecida uma lista personalizada, use-a, caso contrário use a lista padrão
    const listToFilter = processesToFilter || processes;
    
    // Verificar antecipadamente se o usuário tem acesso administrativo
    // para evitar verificações repetidas para cada processo
    const userIsAdmin = user && user.isAdmin;
    
    // Primeiro, filtrar processos por permissões do usuário
    const permissionFiltered = filterByUserPermissions(listToFilter, userIsAdmin);
    
    // Em seguida, filtrar por status
    const statusFiltered = filterByStatus(permissionFiltered, {
      status: filters.status,
      showCompleted: filters.showCompleted
    });
    
    // Por fim, aplicar filtros de departamento, tipo e busca
    return applyRemainingFilters(statusFiltered, filters);
  };
  
  // Função auxiliar para filtrar por permissões de usuário
  const filterByUserPermissions = (processList: Process[], userIsAdmin?: boolean): Process[] => {
    if (!user || userIsAdmin || !user.departments?.length) {
      return processList;
    }
    
    return processList.filter(process => {
      // Para processos não iniciados, verificar o primeiro setor da sequência
      if (process.status === PROCESS_STATUS.NOT_STARTED) {
        // Verificar se o usuário tem acesso ao primeiro setor (Atendimento)
        const firstDepartmentId = "1"; // ID do primeiro setor (Atendimento)
        return user.departments.includes(firstDepartmentId);
      } 
      // Para processos em andamento ou em outros estados, verificar o setor atual
      return user.departments.includes(process.currentDepartment);
    });
  };
  
  // Função auxiliar para aplicar filtros restantes
  const applyRemainingFilters = (processList: Process[], filters: ProcessFilters): Process[] => {
    return processList.filter(process => {
      // Verificar filtro de departamento
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
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
