
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { useProcessPermissionCheckers } from "./useProcessPermissionCheckers";
import { useProcessResponsibilityCache } from "./useProcessResponsibilityCache";
import { useMemo, useRef } from "react";

/**
 * Hook otimizado para gerenciar permissões de visualização de processos
 */
export const useProcessVisibilityPermissions = (processes: Process[]) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  
  const {
    isUserResponsibleForProcess,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    isUserAdmin
  } = useProcessPermissionCheckers();
  
  const {
    checkAndCacheResponsibility,
    hasSectorResponsible,
    clearResponsibilityCache
  } = useProcessResponsibilityCache(processes);
  
  // Referência para controlar permissões já verificadas e evitar recálculos
  const permissionsCheckedRef = useRef<Record<string, boolean>>({});

  /**
   * Limpa o cache de responsabilidades para forçar uma nova verificação
   */
  const refreshResponsibilityCache = () => {
    clearResponsibilityCache();
    permissionsCheckedRef.current = {};
  };

  // Pré-verificar permissões para processos comuns
  const preCheckedPermissions = useMemo(() => {
    if (!user?.id) return {};

    const result: Record<string, boolean> = {};
    
    // Para cada processo, verificar permissões básicas que não requerem consultas assíncronas
    processes.forEach(process => {
      // Se já verificamos este processo antes, não verificar novamente
      if (permissionsCheckedRef.current[process.id] !== undefined) {
        result[process.id] = permissionsCheckedRef.current[process.id];
        return;
      }
      
      let hasPermission = false;
      
      // Admin sempre tem acesso
      if (isUserAdmin()) {
        hasPermission = true;
      }
      // Responsável direto pelo processo (criador ou responsável atual)
      else if (isUserResponsibleForProcess(process, user.id)) {
        hasPermission = true;
      }
      // Processo não iniciado e usuário no setor de atendimento
      else if (process.status === 'not_started' && isUserInAttendanceSector()) {
        hasPermission = true;
      }
      // Verificar se existe responsável no processo.responsibles
      else if (
        process.responsibles && 
        process.currentDepartment && 
        process.responsibles[process.currentDepartment] &&
        process.responsibles[process.currentDepartment].id === user.id
      ) {
        hasPermission = true;
      }
      
      result[process.id] = hasPermission;
      // Armazenar o resultado para consultas futuras
      permissionsCheckedRef.current[process.id] = hasPermission;
    });

    return result;
  }, [processes, user, isUserAdmin, isUserResponsibleForProcess, isUserInAttendanceSector]);

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
    
    // Verificar se já temos o resultado em cache
    if (permissionsCheckedRef.current[process.id] !== undefined) {
      return permissionsCheckedRef.current[process.id];
    }
    
    // Usar permissão pré-verificada se disponível
    if (preCheckedPermissions[process.id] === true) {
      return true;
    }
    
    // Admin sempre tem acesso (caso não tenha sido pré-verificado)
    if (isUserAdmin()) {
      const hasPermission = true;
      permissionsCheckedRef.current[process.id] = hasPermission;
      return hasPermission;
    }

    // Verificar se o usuário é responsável direto pelo processo (criador ou responsável atual)
    if (isUserResponsibleForProcess(process, userId)) {
      const hasPermission = true;
      permissionsCheckedRef.current[process.id] = hasPermission;
      return hasPermission;
    }
    
    // Usuários do setor de atendimento podem ver processos não iniciados
    if (process.status === 'not_started' && isUserInAttendanceSector()) {
      const hasPermission = true;
      permissionsCheckedRef.current[process.id] = hasPermission;
      return hasPermission;
    }

    // Verificar se o usuário é responsável pelo processo no setor atual (via processesResponsibles)
    if (
      processesResponsibles && 
      process.currentDepartment && 
      processesResponsibles[process.id] && 
      processesResponsibles[process.id][process.currentDepartment] &&
      processesResponsibles[process.id][process.currentDepartment].id === userId
    ) {
      const hasPermission = true;
      permissionsCheckedRef.current[process.id] = hasPermission;
      return hasPermission;
    }
    
    // Se o usuário pertence ao setor atual
    if (isUserInCurrentSector(process)) {
      // Processos iniciados precisam verificar se existe um responsável para o setor
      if (process.status !== 'not_started') {
        // Verificar se existe um responsável para o setor
        const hasResponsible = await hasSectorResponsible(process.id, process.currentDepartment);
        
        // Se não existe responsável no setor, o usuário do setor pode ver
        if (!hasResponsible) {
          const hasPermission = true;
          permissionsCheckedRef.current[process.id] = hasPermission;
          return hasPermission;
        }
      }
    }
    
    // Verificar responsabilidade no setor atual (somente se as verificações anteriores falharem)
    if (process.currentDepartment) {
      const isResponsible = await checkAndCacheResponsibility(
        process.id,
        process.currentDepartment,
        userId
      );
      
      permissionsCheckedRef.current[process.id] = isResponsible;
      return isResponsible;
    }
    
    // Não tem permissão
    permissionsCheckedRef.current[process.id] = false;
    return false;
  };

  return {
    canUserViewProcess,
    refreshResponsibilityCache
  };
};
