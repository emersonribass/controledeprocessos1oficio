
import { adminEmails } from "./permissions";

/**
 * Função utilitária para verificar se um email está na lista de administradores
 * @param email Email a ser verificado
 * @returns boolean indicando se o email é de administrador
 */
export const isAdminByEmail = (email: string): boolean => {
  return adminEmails.includes(email.toLowerCase());
};
