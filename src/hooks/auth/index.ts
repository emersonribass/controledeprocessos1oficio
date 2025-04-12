
// Re-exportamos os tipos e funções auxiliares, mas não o AuthProvider e useAuth
// já que estes serão usados da implementação em features/auth
export { isAdmin, isAdminSync } from "./permissions";
export { isAdminByEmail } from "./isAdminByEmail";
export { ProcessResponsibleType, getProcessResponsibilityType } from "./utils";
export type { AuthContextType } from "./types";

// Re-export do useAuth e AuthProvider de features/auth para compatibilidade com código legado
// Isso é temporário para evitar erros durante a transição
export { useAuth, AuthProvider } from "@/features/auth";
