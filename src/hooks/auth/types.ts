
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

export interface LoginProps {
  email: string;
  password: string;
}

export interface LoginResult {
  user: User | null;
  session: Session | null;
  weakPassword: boolean | null;
}

export interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  isAdmin: (email: string) => Promise<boolean>;
  isAdminSync: (email: string) => boolean | null;
}
