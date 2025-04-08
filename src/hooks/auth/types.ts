
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types";

// Adicionando o tipo para o retorno da função login
export type LoginResult = {
  user: User | null;
  session: Session | null;
  weakPassword?: any | null;
};

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => void;
  isLoading: boolean;
  session: Session | null;
  isAdmin: (email: string) => boolean;
};

// Lista de emails de administradores
export const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com"];
