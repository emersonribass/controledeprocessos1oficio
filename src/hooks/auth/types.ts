
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAdmin: (email: string) => Promise<boolean>;
  // Novos métodos para manipulação direta do estado
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading?: (isLoading: boolean) => void;
}

export interface LoginResult {
  user: User | null;
  session: Session | null;
  weakPassword: boolean | null;
  error: Error | null;
}
