
import { User as SupabaseUser, Session } from "@supabase/supabase-js";
import { User } from "@/types";

export type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  session: Session | null;
  isAdmin: (email: string) => boolean;
};
