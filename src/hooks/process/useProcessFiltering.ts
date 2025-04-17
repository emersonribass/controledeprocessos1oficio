
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

/**
 * Hook principal para filtragem de processos com base em permissões e critérios
 */
export const useProcessFiltering = (
  processes: Process[],
  checkers: ResponsibilityCheckers = {}
) => {
  const { user } = useAuth();
  
  // Usar os hooks específicos para cada funcionalidade
  const permissionCheckers = useProcessPermissionCheckers();
  const responsibilityCache = useProcessResponsibilityCache(processes);
  const visibilityPermissions = useProcessVisibilityPermissions(processes);
  const statusFilters = useProcessStatusFilters();
  
  // Usar as funções de verificação passadas ou usar as implementações padrão
  const isUserResponsibleForProcess = checkers.isUserResponsibleForProcess || 
    permissionCheckers.isUserResponsibleForProcess;
  
  // Esta função agora é explicitamente assíncrona e retorna uma Promise<Process[]>
  const filterProcesses = async (
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
    },
    processesToFilter: Process[] = processes,
    processesResponsibles?: Record<string, any>
  ): Promise<Process[]> => {
    const baseList = processesToFilter;
    
    if (!user) return []; // Sem usuário, não há processos para mostrar

    // Primeiro filtrar por permissões do usuário - lógica mais restritiva aqui
    const visibleProcessesPromises = baseList.map(async (process) => {
      const canView = await visibilityPermissions.canUserViewProcess(
        process, 
        user.id, 
        processesResponsibles
      );
      return canView ? process : null;
    });
    
    // Resolver todas as promessas
    const visibleProcessesResults = await Promise.all(visibleProcessesPromises);
    
    // Filtrar os resultados nulos (processos não visíveis)
    const visibleProcesses = visibleProcessesResults.filter(
      (process): process is Process => process !== null
    );

    // Depois aplicar os filtros selecionados pelo usuário
    return statusFilters.applyUserFilters(visibleProcesses, filters);
  };

  return {
    filterProcesses,
    isProcessOverdue: statusFilters.isProcessOverdue,
    // Exportar as funções de verificação para reuso
    ...permissionCheckers,
    ...responsibilityCache
  };
};
