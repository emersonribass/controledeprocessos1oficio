
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { useProcessPermissionCheckers } from "./useProcessPermissionCheckers";
import { useProcessResponsibilityCache } from "./useProcessResponsibilityCache";

/**
 * Hook para gerenciar permissões de visualização de processos
 */
export const useProcessVisibilityPermissions = (processes: Process[]) => {
  const { user } = useAuth();
  const { isAdmin } = useUserProfile();
  
  const {
    isUserResponsibleForProcess,
    isUserInAttendanceSector,
    isUserInCurrentSector
  } = useProcessPermissionCheckers();
  
  const {
    checkAndCacheResponsibility,
    hasSectorResponsible,
    clearResponsibilityCache
  } = useProcessResponsibilityCache(processes);

  /**
   * Limpa o cache de responsabilidades para forçar uma nova verificação
   */
  const refreshResponsibilityCache = () => {
    clearResponsibilityCache();
  };

  /**
   * Verifica se um usuário tem permissão para visualizar um processo específico
   */
  const canUserViewProcess = async (
    process: Process, 
    userId: string,
    processesResponsibles?: Record<string, any>
  ): Promise<boolean> => {
    if (!userId) return false;
    
    if (isAdmin()) return true;

    // Verificar se o usuário é responsável direto pelo processo
    if (isUserResponsibleForProcess(process, userId)) {
      return true;
    }
    
    // Usuários do setor de atendimento podem ver processos não iniciados
    if (process.status === 'not_started' && isUserInAttendanceSector()) {
      return true;
    }

    // Verificar se o usuário é responsável pelo processo no setor atual (via cache)
    if (processesResponsibles && 
        processesResponsibles[process.id] && 
        processesResponsibles[process.id][process.currentDepartment] &&
        processesResponsibles[process.id][process.currentDepartment].usuario_id === userId) {
      return true;
    }
    
    // Se o usuário pertence ao setor atual
    if (isUserInCurrentSector(process)) {
      // Verificar se existe um responsável para o setor
      const hasResponsible = await hasSectorResponsible(process.id, process.currentDepartment);
      if (!hasResponsible) {
        return true;
      }
    }
    
    // Verificar responsabilidade no setor atual
    const isResponsible = await checkAndCacheResponsibility(
      process.id,
      process.currentDepartment,
      userId
    );
    
    return isResponsible;
  };

  return {
    canUserViewProcess,
    refreshResponsibilityCache
  };
};
