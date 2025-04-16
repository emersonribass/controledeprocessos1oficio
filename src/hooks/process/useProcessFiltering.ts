
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
      if (!userProfile || !userProfile.setores_atribuidos) return false;
      return userProfile.setores_atribuidos.includes(process.currentDepartment);
    });
    
  // Verificar se o usuário pertence ao setor de atendimento (setor 1)
  const isUserInAttendanceSector = () => {
    if (!userProfile || !userProfile.setores_atribuidos) return false;
    return userProfile.setores_atribuidos.includes("1");
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

      // Aplicar regras de visibilidade conforme perfil do usuário
      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        // Administradores veem todos os processos
        if (isAdmin()) {
          console.log(`Usuário ${user.id} é admin - processo ${process.protocolNumber} visível`);
          return true;
        }
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          console.log(`Processo ${process.protocolNumber} não iniciado e usuário ${user.id} é do setor de atendimento - visível`);
          return true;
        }
        
        // Usuários com perfil "usuario" só podem ver processos que são responsáveis ou estão no setor atual
        if (userProfile?.perfil === 'usuario') {
          // Usuário é responsável direto pelo processo
          if (isUserResponsibleForProcess(process, user.id)) {
            console.log(`Usuário ${user.id} é responsável pelo processo ${process.protocolNumber} - visível`);
            return true;
          }
          
          // Usuário pertence ao setor atual do processo
          if (isUserResponsibleForSector(process, user.id)) {
            console.log(`Usuário ${user.id} pertence ao setor ${process.currentDepartment} do processo ${process.protocolNumber} - visível`);
            return true;
          }
          
          console.log(`Processo ${process.protocolNumber} não visível para usuário ${user.id} com perfil 'usuario'`);
          return false;
        }
        
        // Para outros perfis não especificados, manter a lógica original
        if (isUserResponsibleForProcess(process, user.id)) {
          return true;
        }
        
        if (isUserResponsibleForSector(process, user.id)) {
          return true;
        }
        
        console.log(`Processo ${process.protocolNumber} não visível para usuário ${user.id}`);
        // Se não satisfaz nenhuma condição acima, não deve ver o processo
        return false;
      });

      console.log(`Processos visíveis após filtro de permissões: ${visibleProcesses.length} de ${baseList.length}`);
      
      if (userProfile) {
        console.log(`Perfil do usuário: ${userProfile.perfil}, Setores: ${JSON.stringify(userProfile.setores_atribuidos)}`);
      }

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
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserResponsibleForSector, isUserInAttendanceSector, userProfile]);

  const isProcessOverdue = (process: Process) => {
    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector
  };
};
