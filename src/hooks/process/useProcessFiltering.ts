
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

      // Aplicar regras de visibilidade - PONTO CRÍTICO DA APLICAÇÃO
      // Usuários só podem ver processos que:
      // 1. São administradores (veem tudo)
      // 2. São responsáveis pelo processo
      // 3. Pertencem ao setor atual do processo
      // 4. Pertencem ao setor de atendimento E o processo não está iniciado
      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        // Administradores veem todos os processos
        if (isAdmin) return true;
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          return true;
        }
        
        // Usuário é responsável direto pelo processo
        if (isUserResponsibleForProcess(process, user.id)) return true;
        
        // Usuário pertence ao setor atual do processo
        if (isUserResponsibleForSector(process, user.id)) return true;
        
        // Se não satisfaz nenhuma condição acima, não deve ver o processo
        return false;
      });

      console.log(`Processos visíveis após filtro de permissões: ${visibleProcesses.length}`);

      // Aplicar os filtros selecionados pelo usuário na interface
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
