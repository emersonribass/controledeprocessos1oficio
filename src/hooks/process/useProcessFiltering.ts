
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

    // Se o usuário for administrador, pular verificações de permissão e aplicar apenas filtros
    if (permissionCheckers.isUserAdmin()) {
      return statusFilters.applyUserFilters(baseList, filters, processesResponsibles);
    }

    const visibleProcessesPromises = baseList.map(async (process) => {
      // Verificar se o usuário tem permissão para ver o processo
      const canView = await visibilityPermissions.canUserViewProcess(
        process, 
        user.id, 
        processesResponsibles
      );

      // Se não tem permissão, retorna null
      if (!canView) return null;

      return process;
    });
    
    const visibleProcessesResults = await Promise.all(visibleProcessesPromises);
    const visibleProcesses = visibleProcessesResults.filter(
      (process): process is Process => process !== null
    );

    // Passando o objeto processesResponsibles para o filtro de status
    return statusFilters.applyUserFilters(visibleProcesses, filters, processesResponsibles);
  };

  return {
    filterProcesses,
    isProcessOverdue: statusFilters.isProcessOverdue,
    refreshResponsibilityCache: visibilityPermissions.refreshResponsibilityCache,
    ...permissionCheckers,
    ...responsibilityCache
  };
};
