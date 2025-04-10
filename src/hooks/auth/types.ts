
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

export type LoginResult = {
  user: User | null;
  session: Session | null;
  weakPassword: string | null;
  error: Error | null;
};

export type AuthContextType = {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  authInitialized?: boolean;
  isAdmin: (email: string) => Promise<boolean>;
  login: (email: string, password: string) => Promise<LoginResult>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading?: (isLoading: boolean) => void;
};
