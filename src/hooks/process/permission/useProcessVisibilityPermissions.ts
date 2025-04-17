
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
    hasSectorResponsible
  } = useProcessResponsibilityCache(processes);

  /**
   * Verifica se um usuário tem permissão para visualizar um processo específico
   */
  const canUserViewProcess = async (
    process: Process, 
    userId: string,
    processesResponsibles?: Record<string, any>
  ): Promise<boolean> => {
    if (!userId) return false; // Não autenticado não vê nada
    
    // Verificar se o usuário é administrador - admins veem tudo
    if (isAdmin()) return true;
    
    // Usuários do setor de atendimento podem ver processos não iniciados
    if (process.status === 'not_started' && isUserInAttendanceSector()) {
      return true;
    }
    
    // Verificar se o usuário é responsável direto pelo processo
    if (isUserResponsibleForProcess(process, userId)) {
      return true;
    }
    
    // Verificar se o usuário pertence ao setor atual do processo E o processo ainda não tem responsável
    if (isUserInCurrentSector(process)) {
      // Verificar se já existe um responsável para o processo no setor atual
      const hasResponsible = await hasSectorResponsible(process.id, process.currentDepartment);
      
      // Se NÃO existe responsável, o usuário pode ver o processo
      if (!hasResponsible) {
        return true;
      }
    }
    
    // Verificar se o usuário é responsável específico para este processo neste setor
    // Usando o cache de responsabilidades (processesResponsibles) ou fazendo consulta direta
    if (
      processesResponsibles && 
      processesResponsibles[process.id] && 
      processesResponsibles[process.id][process.currentDepartment]
    ) {
      const sectorResponsible = processesResponsibles[process.id][process.currentDepartment];
      // Verificar se o responsável é o usuário atual
      if (sectorResponsible && sectorResponsible.usuario_id === userId) {
        return true;
      }
    } else {
      // Se não temos o cache de responsáveis, fazer a verificação direta
      const isResponsible = await checkAndCacheResponsibility(
        process.id,
        process.currentDepartment,
        userId
      );
      
      if (isResponsible) {
        return true;
      }
    }
    
    // Se não atende a nenhuma das condições acima, o processo não deve ser visível
    return false;
  };

  return {
    canUserViewProcess
  };
};
