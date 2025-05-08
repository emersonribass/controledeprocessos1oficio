
import { User } from "@/types";

/**
 * Obtém informações de perfil do usuário de forma centralizada
 */
export const getUserProfileInfo = (user: User | null) => {
  if (!user) {
    return {
      isAdmin: false,
      isAtendimento: false,
      assignedSectors: [] as string[]
    };
  }

  return {
    isAdmin: user.perfil === 'administrador',
    isAtendimento: user.setores_atribuidos?.includes("1") || false,
    assignedSectors: user.setores_atribuidos || []
  };
};

/**
 * Verifica se o usuário é administrador
 */
export const isUserAdmin = (user: User | null): boolean => {
  return getUserProfileInfo(user).isAdmin;
};

/**
 * Verifica se o usuário pertence ao setor de atendimento
 */
export const isUserInAttendanceSector = (user: User | null): boolean => {
  return getUserProfileInfo(user).isAtendimento;
};

/**
 * Obtém os setores atribuídos ao usuário
 */
export const getUserAssignedSectors = (user: User | null): string[] => {
  return getUserProfileInfo(user).assignedSectors;
};
