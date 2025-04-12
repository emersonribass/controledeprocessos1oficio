
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

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
      if (user && !isAdmin(user.email) && user.departments?.length > 0) {
        // Verificar se o usuário é do perfil "usuario" (utilizando o sistema de permissões)
        const isUserProfileRegular = !isAdmin(user.email);
        const userHasAttendanceSector = user.departments.includes('1');
        
        // Para processos não iniciados, apenas usuários do setor 1 (Atendimento) podem ver
        if (process.status === 'not_started') {
          // Se o usuário não tem o setor 1 em seus setores atribuídos, não mostrar
          if (!userHasAttendanceSector) {
            return false;
          }
        } 
        // Para processos em andamento, regras mais específicas para usuários comuns
        else if (isUserProfileRegular && !userHasAttendanceSector) {
          // Verificar se o usuário pertence ao departamento atual
          const userBelongsToDepartment = user.departments.includes(process.currentDepartment);
          
          // Verificar se o usuário é o responsável pelo processo
          const isUserResponsible = process.responsibleUserId === user.id;
          
          // Verificar se o processo já tem responsável no setor atual
          const hasResponsibleInCurrentSector = 
            processesResponsibles && 
            processesResponsibles[process.id] && 
            processesResponsibles[process.id][process.currentDepartment];
          
          // Mostrar apenas se: o usuário é do setor E (é responsável OU não há responsável)
          if (!userBelongsToDepartment || (!isUserResponsible && hasResponsibleInCurrentSector)) {
            return false;
          }
        }
        // Para outros tipos de usuário, só mostrar se pertence ao departamento atual
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
