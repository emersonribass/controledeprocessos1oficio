
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

// Tipos para as funções de admin
export interface AdminUserManagement {
  listUsers: () => Promise<{
    data: {
      users: Array<{
        id: string;
        email: string;
        created_at: string;
        last_sign_in_at?: string;
        raw_user_meta_data: any;
      }> | null;
    } | null;
    error: Error | null;
  }>;
  
  deleteUser: (userId: string) => Promise<{
    data: boolean | null;
    error: Error | null;
  }>;
}

// Declara as extensões para o tipo do módulo @supabase/supabase-js
declare module '@supabase/supabase-js' {
  interface SupabaseAuthClient {
    admin: AdminUserManagement;
  }
}
