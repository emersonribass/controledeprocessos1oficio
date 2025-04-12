
import { supabase } from "@/integrations/supabase/client";

export const isAdminByEmail = async (email: string): Promise<boolean> => {
  try {
    if (!email) return false;
    
    // Buscar o usuário pelo e-mail
    const { data, error } = await supabase
      .from("usuarios")
      .select("perfil")
      .eq("email", email)
      .single();

    if (error) {
      console.error("Erro ao verificar se usuário é admin:", error);
      return false;
    }

    return data?.perfil === "admin";
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    return false;
  }
};
