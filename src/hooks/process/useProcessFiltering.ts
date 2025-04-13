import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";



// Define o tipo das funções que serão passadas para verificar responsabilidade
interface ResponsibilityCheckers {
  isUserResponsibleForProcess: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector: (process: Process, userId: string) => boolean;
}

//Hook para filtrar processos com base em critérios específicos
//Agora usa funções síncronas para verificar se o usuário pode ver o processo
export const useProcessFiltering = (processes: Process[],

  {
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  }: ResponsibilityCheckers // <-- NOVO: recebendo funções de verificação do useProcesses
                                   
) => {
  
  const { user, isAdmin } = useAuth();

  const filterProcesses = useMemo(() => (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    },
    processesToFilter?: Process[]
    //processesResponsibles?: Record<string, any>
  ) => {
    const baseList = processesToFilter || processes;

    //FILTRO DE VISIBILIDADE — verifica se o usuário pode ver o processo
    const visibleProcesses = baseList.filter((process) => {
      if (user && !isAdmin(user.email)) {
        const isResponsible = isUserResponsibleForProcess(process, user.id);
        const isSectorResponsible = isUserResponsibleForSector(process, user.id);

        return isResponsible || isSectorResponsible;
      }
      return true; // Admins veem tudo
    });

    // Aplica os demais filtros
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

      if (
        filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserResponsibleForSector]); //MEMO DEPENDENTE DAS FUNÇÕES

  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};