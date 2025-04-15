
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";
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
  
  // Usar as funções de verificação passadas ou usar as implementações padrão
  const isUserResponsibleForProcess = checkers.isUserResponsibleForProcess || 
    ((process: Process, userId: string) => {
      return process.userId === userId || process.responsibleUserId === userId;
    });
  
  const isUserResponsibleForSector = checkers.isUserResponsibleForSector || 
    ((process: Process, userId: string) => {
      if (!userProfile || !userProfile.setores_atribuidos || !userProfile.setores_atribuidos.length) return false;
      return userProfile.setores_atribuidos.includes(process.currentDepartment);
    });
    
  // Verificar se o usuário pertence ao setor de atendimento (assumindo que o setor 1 é o de atendimento)
  const isUserInAttendanceSector = () => {
    return userProfile?.setores_atribuidos?.includes("1") || false;
  };

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

      // Com as políticas RLS, não precisamos mais filtrar por permissões do usuário
      // As consultas já estão retornando apenas os processos que o usuário tem permissão para ver
      const visibleProcesses = baseList;

      // Aplicar apenas os filtros selecionados pelo usuário
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
  }, [processes]);

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
