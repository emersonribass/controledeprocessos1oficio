
import { User } from "@supabase/supabase-js";
import { Session } from "@supabase/supabase-js";

// Tipo para usuário no contexto da aplicação
export interface UserData {
  id: string;
  email: string;
  nome: string | null;
  name: string | null;  // Adicionado para compatibilidade
  perfil: string | null;
  profile: string | null;  // Adicionado para compatibilidade
  ativo: boolean;
  setores_atribuidos: string[];
  departments: string[];  // Adicionado para compatibilidade
  isAdmin: boolean;  // Adicionado para compatibilidade
}

// Tipo de retorno para a operação de login
export interface LoginResult {
  user: UserData | null;
  session: Session | null;
  weakPassword: boolean | null;
}

// Tipo para o contexto de autenticação
export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  session: Session | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAdmin: (email: string) => Promise<boolean>;
  checkAdminStatus: (email: string) => Promise<boolean>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error: any }>;
}
