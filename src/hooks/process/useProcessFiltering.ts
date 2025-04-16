
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";

/**
 * Hook para filtrar processos com base em critérios específicos
 */
export const useProcessFiltering = (processes: Process[]) => {
  const { user, isAdmin } = useAuth();
  
  // Memoizando a função para não recriar a cada renderização
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
    // Se for fornecida uma lista personalizada, use-a, caso contrário use a lista padrão
    const listToFilter = processesToFilter || processes;
    
    return listToFilter.filter((process) => {
      // Excluir processos concluídos se o filtro excludeCompleted estiver ativo
      if (filters.excludeCompleted && process.status === 'completed') {
        return false;
      }

      // Verificar se o usuário tem permissão para ver este processo
      if (user && !isAdmin(user.email)) {
        // Para usuários regulares, mostra apenas processos onde:
        
        // 1. O usuário é responsável pelo processo inteiro
        const isUserResponsibleForProcess = process.responsibleUserId === user.id;
        
        // 2. Ou o usuário é responsável pelo setor atual do processo
        const isUserResponsibleForCurrentSector = 
          processesResponsibles && 
          processesResponsibles[process.id] && 
          processesResponsibles[process.id][process.currentDepartment] && 
          processesResponsibles[process.id][process.currentDepartment].usuario_id === user.id;
        
        // Se o usuário não for responsável pelo processo, nem pelo setor atual, não mostrar
        if (!isUserResponsibleForProcess && !isUserResponsibleForCurrentSector) {
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
  }, [processes, user, isAdmin]);

  /**
   * Verifica se um processo está com prazo vencido
   */
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