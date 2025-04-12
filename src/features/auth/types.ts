
import { User } from "@supabase/supabase-js";

export type UserData = {
  id: string;
  email: string;
  name: string;
  profile: string;
  isAdmin: boolean;
  departments: string[];
};

export interface AuthContextType {
  user: UserData | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<{ session: any; error: any; }>;
  logout: () => Promise<void>;
  isAdmin: (email: string) => Promise<boolean>;
  checkAdminStatus: (email: string) => Promise<boolean>;
  updateUserPassword: (newPassword: string) => Promise<{ success: boolean; error: any }>;
}
