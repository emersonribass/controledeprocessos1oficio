
// Lista de emails de administradores
export const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com"];

// Função para verificar se um email pertence a um administrador
export const isAdmin = (email: string): boolean => {
  return adminEmails.includes(email);
};
