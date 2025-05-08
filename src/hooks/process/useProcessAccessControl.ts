
import { useCallback } from "react";
import { Process, User } from "@/types";
import { getUserProfileInfo } from "@/utils/userProfileUtils";
import { processDataService } from "@/services/ProcessDataService";
import { supabase } from "@/integrations/supabase/client";

export const useProcessAccessControl = () => {
  /**
   * Verifica se o usuário é responsável direto pelo processo
   */
  const isUserProcessOwner = useCallback((process: Process, userId: string) => {
    return process.userId === userId || process.responsibleUserId === userId;
  }, []);
  
  /**
   * Verifica se o usuário pertence ao setor atual do processo
   */
  const isUserInCurrentSector = useCallback((process: Process, user: User | null) => {
    if (!user?.setores_atribuidos || !process.currentDepartment) {
      return false;
    }
    return user.setores_atribuidos.includes(process.currentDepartment);
  }, []);

  /**
   * Verifica se o usuário pode ver um processo específico
   */
  const canViewProcess = useCallback(async (process: Process, user: User | null): Promise<boolean> => {
    if (!user) return false;
    
    const { isAdmin, isAtendimento, assignedSectors } = getUserProfileInfo(user);

    // Administradores podem ver tudo
    if (isAdmin) return true;

    // Verificar se o usuário é responsável direto pelo processo
    if (isUserProcessOwner(process, user.id)) {
      return true;
    }
    
    // Usuários do setor de atendimento podem ver processos não iniciados
    if (process.status === 'not_started' && isAtendimento) {
      return true;
    }

    // Se o usuário pertence ao setor atual
    if (isUserInCurrentSector(process, user)) {
      // Verificar se existe um responsável para o setor
      const hasResponsible = await processDataService.hasSectorResponsible(process.id, process.currentDepartment);
      
      // Se não houver responsável, qualquer usuário do setor pode ver
      if (!hasResponsible) {
        return true;
      }
      
      // Se houver responsável, verificar se é o usuário atual
      const responsible = await processDataService.getResponsibleForSector(process.id, process.currentDepartment);
      return responsible?.id === user.id;
    }
    
    // Por padrão, não pode ver
    return false;
  }, [isUserProcessOwner, isUserInCurrentSector]);

  /**
   * Verifica se o usuário pode aceitar a responsabilidade por um processo
   */
  const canAcceptProcess = useCallback(async (process: Process, user: User | null): Promise<boolean> => {
    if (!user) return false;
    
    const { isAdmin } = getUserProfileInfo(user);
    
    // Administradores sempre podem aceitar processos
    if (isAdmin) return true;
    
    // Usuário precisa pertencer ao setor atual
    if (!isUserInCurrentSector(process, user)) {
      return false;
    }
    
    // Verificar se já existe um responsável para o setor
    const hasResponsible = await processDataService.hasSectorResponsible(process.id, process.currentDepartment);
    
    // Se já existe responsável, não pode aceitar
    return !hasResponsible;
  }, [isUserInCurrentSector]);

  /**
   * Verifica se o usuário pode iniciar um processo
   */
  const canStartProcess = useCallback((user: User | null): boolean => {
    if (!user) return false;
    
    const { isAdmin, isAtendimento } = getUserProfileInfo(user);
    
    // Administradores e usuários do setor de atendimento podem iniciar processos
    return isAdmin || isAtendimento;
  }, []);

  /**
   * Verifica se o usuário é responsável pelo setor específico em um processo
   */
  const isResponsibleForSector = useCallback(async (process: Process, userId: string, sectorId: string): Promise<boolean> => {
    const responsible = await processDataService.getResponsibleForSector(process.id, sectorId);
    return responsible?.id === userId;
  }, []);

  /**
   * Limpa o cache de responsabilidades
   */
  const invalidateResponsibilityCache = useCallback(() => {
    processDataService.clearCache();
  }, []);

  return {
    canViewProcess,
    canAcceptProcess,
    canStartProcess,
    isUserProcessOwner,
    isUserInCurrentSector,
    isResponsibleForSector,
    invalidateResponsibilityCache
  };
};
