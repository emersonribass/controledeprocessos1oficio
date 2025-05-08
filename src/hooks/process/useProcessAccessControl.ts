
import { User, Process } from "@/types";
import { useAuth } from "../auth";
import { getUserProfileInfo } from "@/utils/userProfileUtils";

/**
 * Hook centralizado para controle de acesso e permissões de processos
 */
export const useProcessAccessControl = () => {
  const { user } = useAuth();

  /**
   * Verifica se o usuário está no setor de atendimento
   */
  const isInAttendanceSector = (userId: string): boolean => {
    // Se userId for vazio, usa o usuário atual
    const currentUser = userId ? { id: userId, setores_atribuidos: user?.setores_atribuidos } : user;
    return getUserProfileInfo(currentUser as User).isAtendimento;
  };

  /**
   * Verifica se o usuário está em um determinado setor
   */
  const isInSector = (sectorId: string, userId: string): boolean => {
    // Se userId for vazio, usa o usuário atual
    const currentUser = userId ? { id: userId, setores_atribuidos: user?.setores_atribuidos } : user;
    return getUserProfileInfo(currentUser as User).assignedSectors.includes(sectorId);
  };

  /**
   * Verifica se o usuário é administrador
   */
  const isAdmin = (userId: string): boolean => {
    // Se userId for vazio, usa o usuário atual
    const currentUser = userId ? { id: userId, perfil: user?.perfil } : user;
    return getUserProfileInfo(currentUser as User).isAdmin;
  };

  /**
   * Verifica se o usuário pode visualizar o processo
   */
  const canViewProcess = (process: Process, userId: string): boolean => {
    // Administradores podem ver todos os processos
    if (isAdmin(userId)) return true;

    // Usuários do setor de atendimento podem ver processos não iniciados
    if (process.status === "not_started" && isInAttendanceSector(userId)) return true;

    // Usuários podem ver processos nos setores que estão atribuídos
    if (process.currentDepartment && isInSector(process.currentDepartment, userId)) return true;

    // Verificar se o usuário é responsável pelo processo
    if (process.responsibleUserId === userId) return true;

    return false;
  };

  /**
   * Verifica se o usuário pode iniciar um processo
   */
  const canStartProcess = (userId: string): boolean => {
    // Apenas usuários do setor de atendimento podem iniciar processos
    return isInAttendanceSector(userId) || isAdmin(userId);
  };

  /**
   * Verifica se o usuário pode aceitar um processo
   */
  const canAcceptProcess = (process: Process, userId: string): boolean => {
    // Usuários não podem aceitar processos que já possuem responsável no setor
    // Isso será verificado pelo serviço de responsabilidade
    
    // Se for do setor de atendimento e o processo está no setor de atendimento
    if (isInAttendanceSector(userId) && process.currentDepartment === "1") return true;

    // Se não for do setor de atendimento, mas estiver no setor atual
    if (process.currentDepartment && isInSector(process.currentDepartment, userId)) return true;

    return false;
  };

  /**
   * Verifica se o usuário é responsável pelo processo
   */
  const isResponsible = (process: Process, userId: string, sectorId?: string): boolean => {
    // Se não informar o setor, verifica se é responsável global
    if (!sectorId) {
      return process.responsibleUserId === userId;
    }

    // Verificar responsabilidade no setor será feito pelo serviço de responsabilidade
    return false;
  };

  /**
   * Verifica se o usuário é dono do processo (responsável principal)
   */
  const isProcessOwner = (process: Process, userId: string): boolean => {
    return process.userId === userId || process.responsibleUserId === userId;
  };
  
  /**
   * Verifica se o usuário está no setor atual do processo
   */
  const isUserInCurrentSector = (process: Process, userId: string): boolean => {
    if (!process.currentDepartment) return false;
    return isInSector(process.currentDepartment, userId);
  };

  return {
    canViewProcess,
    canStartProcess,
    canAcceptProcess,
    isResponsible,
    isProcessOwner,
    isInAttendanceSector,
    isInSector,
    isAdmin,
    isUserInCurrentSector
  };
};
