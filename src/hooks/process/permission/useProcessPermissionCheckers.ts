
import { Process } from "@/types";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

/**
 * Hook que fornece funções para verificar permissões relacionadas aos processos
 */
export const useProcessPermissionCheckers = () => {
  const { userProfile } = useUserProfile();
  
  /**
   * Verifica se o usuário é responsável direto pelo processo
   * Um usuário é responsável direto se:
   * 1. É o criador do processo (userId)
   * 2. É o responsável atual pelo processo (responsibleUserId)
   */
  const isUserResponsibleForProcess = (process: Process, userId: string) => {
    // Verifica se o usuário é o criador ou o responsável direto pelo processo
    return process.userId === userId || process.responsibleUserId === userId;
  };
  
  /**
   * Verifica se o usuário é responsável específico para este processo neste setor
   * Esta é apenas uma implementação padrão, a verificação real ocorre via consulta direta no banco
   */
  const isUserResponsibleForSector = (process: Process, userId: string) => {
    // Não precisamos mais da verificação de pertencer ao setor
    // Agora verificamos apenas se o usuário é responsável específico para este processo neste setor
    // Esta verificação será feita diretamente no filterProcesses usando o cache
    return false;
  };
    
  /**
   * Verifica se o usuário pertence ao setor de atendimento (assumindo que o setor 1 é o de atendimento)
   */
  const isUserInAttendanceSector = () => {
    return userProfile?.setores_atribuidos?.includes("1") || false;
  };
  
  /**
   * Verifica se o usuário pertence ao setor atual do processo
   */
  const isUserInCurrentSector = (process: Process) => {
    if (!userProfile?.setores_atribuidos || !process.currentDepartment) {
      return false;
    }
    return userProfile.setores_atribuidos.includes(process.currentDepartment);
  };

  /**
   * Verifica se o usuário é administrador
   */
  const isUserAdmin = () => {
    return userProfile?.perfil === 'admin';
  };

  return {
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    isUserAdmin
  };
};
