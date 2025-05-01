
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { useProcessPermissionCheckers } from "./useProcessPermissionCheckers";
import { useProcessResponsibilityCache } from "./useProcessResponsibilityCache";
import { useMemo } from "react";

/**
 * Hook otimizado para gerenciar permissões de visualização de processos
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

  // Pré-verificar permissões para processos comuns
  const preCheckedPermissions = useMemo(() => {
    if (!user?.id) return {};

    const result: Record<string, boolean> = {};
    
    // Para cada processo, verificar permissões básicas que não requerem consultas assíncronas
    processes.forEach(process => {
      // Admin sempre tem acesso
      if (isAdmin()) {
        result[process.id] = true;
        return;
      }

      // Responsável direto pelo processo
      if (isUserResponsibleForProcess(process, user.id)) {
        result[process.id] = true;
        return;
      }

      // Processo não iniciado e usuário no setor de atendimento
      if (process.status === 'not_started' && isUserInAttendanceSector()) {
        result[process.id] = true;
        return;
      }

      // Verificar se existe responsável no processo.responsibles
      if (process.responsibles && 
          process.currentDepartment && 
          process.responsibles[process.currentDepartment] &&
          process.responsibles[process.currentDepartment].id === user.id) {
        result[process.id] = true;
      }
    });

    return result;
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserInAttendanceSector]);

  /**
   * Verifica se um usuário tem permissão para visualizar um processo específico
   * Otimizado para usar cache de permissões pré-verificadas
   */
  const canUserViewProcess = async (
    process: Process, 
    userId: string,
    processesResponsibles?: Record<string, any>
  ): Promise<boolean> => {
    if (!userId) return false;
    
    // Usar permissão pré-verificada se disponível
    if (preCheckedPermissions[process.id] === true) {
      return true;
    }
    
    // Admin sempre tem acesso (caso não tenha sido pré-verificado)
    if (isAdmin()) return true;

    // Verificar se o usuário é responsável direto pelo processo (caso não tenha sido pré-verificado)
    if (isUserResponsibleForProcess(process, userId)) {
      return true;
    }
    
    // Usuários do setor de atendimento podem ver processos não iniciados (caso não tenha sido pré-verificado)
    if (process.status === 'not_started' && isUserInAttendanceSector()) {
      return true;
    }

    // Verificar se o usuário é responsável pelo processo no setor atual (via processesResponsibles)
    if (processesResponsibles && 
        process.currentDepartment && 
        processesResponsibles[process.id] && 
        processesResponsibles[process.id][process.currentDepartment] &&
        processesResponsibles[process.id][process.currentDepartment].id === userId) {
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
    
    // Verificar responsabilidade no setor atual (somente se as verificações anteriores falharem)
    if (process.currentDepartment) {
      const isResponsible = await checkAndCacheResponsibility(
        process.id,
        process.currentDepartment,
        userId
      );
      
      return isResponsible;
    }
    
    return false;
  };

  return {
    canUserViewProcess,
    refreshResponsibilityCache
  };
};
