
import { supabase } from "@/integrations/supabase/client";

export const isAdmin = async (email: string): Promise<boolean> => {
  try {
    if (!email) return false;
    
    const { data, error } = await supabase
      .from("usuarios")
      .select("perfil")
      .eq("email", email)
      .single();

    if (error || !data) {
      console.error("Erro ao verificar permissões de admin:", error);
      return false;
    }

    return data.perfil === "admin";
  } catch (error) {
    console.error("Erro ao verificar permissões de admin:", error);
    return false;
  }
};

export const isAdminSync = (profile: string | undefined): boolean => {
  return profile === "admin";
};
