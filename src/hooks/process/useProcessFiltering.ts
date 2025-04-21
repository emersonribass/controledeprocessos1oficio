
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useProcessPermissionCheckers } from "./permission/useProcessPermissionCheckers";
import { useProcessResponsibilityCache } from "./permission/useProcessResponsibilityCache";
import { useProcessVisibilityPermissions } from "./permission/useProcessVisibilityPermissions";
import { useProcessStatusFilters } from "./filters/useProcessStatusFilters";

interface ResponsibilityCheckers {
  isUserResponsibleForProcess?: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector?: (process: Process, userId: string) => boolean;
}

export const useProcessFiltering = (
  processes: Process[],
  checkers: ResponsibilityCheckers = {}
) => {
  const { user } = useAuth();
  
  const permissionCheckers = useProcessPermissionCheckers();
  const responsibilityCache = useProcessResponsibilityCache(processes);
  const visibilityPermissions = useProcessVisibilityPermissions(processes);
  const statusFilters = useProcessStatusFilters();
  
  const isUserResponsibleForProcess = checkers.isUserResponsibleForProcess || 
    permissionCheckers.isUserResponsibleForProcess;

  const filterProcesses = async (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
      startDate?: string;
      endDate?: string;
      responsibleUser?: string;
    },
    processesToFilter: Process[] = processes,
    processesResponsibles?: Record<string, any>
  ): Promise<Process[]> => {
    const baseList = processesToFilter;
    
    if (!user) return [];

    const visibleProcessesPromises = baseList.map(async (process) => {
      // Verificar se o usuário tem permissão para ver o processo
      const canView = await visibilityPermissions.canUserViewProcess(
        process, 
        user.id, 
        processesResponsibles
      );

      // Se não tem permissão ou não atende aos critérios de filtragem, retorna null
      if (!canView) return null;

      // Verificar o filtro de responsável
      if (filters.responsibleUser) {
        const isResponsible = 
          // Verifica se é responsável geral pelo processo
          process.usuario_responsavel === filters.responsibleUser ||
          // Verifica se é responsável em algum setor
          (processesResponsibles?.[process.id]?.some(
            (resp: any) => resp.usuario_id === filters.responsibleUser
          ));

        if (!isResponsible) return null;
      }

      return process;
    });
    
    const visibleProcessesResults = await Promise.all(visibleProcessesPromises);
    const visibleProcesses = visibleProcessesResults.filter(
      (process): process is Process => process !== null
    );

    return statusFilters.applyUserFilters(visibleProcesses, filters);
  };

  return {
    filterProcesses,
    isProcessOverdue: statusFilters.isProcessOverdue,
    ...permissionCheckers,
    ...responsibilityCache
  };
};
