
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo, useCallback } from "react";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

interface ResponsibilityCheckers {
  isUserResponsibleForProcess?: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector?: (process: Process, userId: string) => boolean;
}

export const useProcessFiltering = (
  processes: Process[],
  checkers: ResponsibilityCheckers = {}
) => {
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUserProfile();
  
  // Implementação da função isUserResponsibleForProcess com cache interno
  const isUserResponsibleForProcess = useCallback((process: Process, userId: string) => {
    // Verificar somente responsabilidade direta pelo processo (atual)
    return process.userId === userId || process.responsibleUserId === userId;
  }, []);
  
  // Implementação da função isUserResponsibleForSector com cache interno
  const isUserResponsibleForSector = useCallback((process: Process, userId: string) => {
    if (!userProfile || !userProfile.setores_atribuidos || !userProfile.setores_atribuidos.length) return false;
    // Verificar somente se o usuário pertence ao setor atual do processo
    return userProfile.setores_atribuidos.includes(process.currentDepartment);
  }, [userProfile]);
    
  // Verificar se o usuário pertence ao setor de atendimento (assumindo que o setor 1 é o de atendimento)
  const isUserInAttendanceSector = useCallback(() => {
    return userProfile?.setores_atribuidos?.includes("1") || false;
  }, [userProfile]);

  // Função de filtro memoizada para melhor performance
  const filterProcesses = useMemo(() => {
    return (
      filters: {
        department?: string;
        status?: string;
        processType?: string;
        search?: string;
        excludeCompleted?: boolean;
      },
      processesToFilter?: Process[]
    ): Process[] => {
      const baseList = processesToFilter || processes;

      // Primeiro filtrar por permissões do usuário
      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        // Verificar se o usuário é administrador
        const isUserAdmin = isAdmin();
        if (isUserAdmin) return true;
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          return true;
        }
        
        // Verificar se o usuário é responsável direto pelo processo (atual)
        const isResponsibleForProcess = isUserResponsibleForProcess(process, user.id);
        
        // Verificar se o usuário pertence ao setor atual do processo
        const isResponsibleForCurrentSector = isUserResponsibleForSector(process, user.id);
        
        // Usuário só vê o processo se for responsável por ele ou pertencer ao setor atual
        return isResponsibleForProcess || isResponsibleForCurrentSector;
      });

      // Depois aplicar os filtros selecionados pelo usuário
      return visibleProcesses.filter((process) => {
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
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserResponsibleForSector, isUserInAttendanceSector]);

  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
    // Exportar as funções de verificação para reuso
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector
  };
};
