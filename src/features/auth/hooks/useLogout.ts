
import { supabase } from "@/integrations/supabase/client";

export const useLogout = () => {
  const handleLogout = async () => {
    try {
      // Limpar dados de autenticação local
      localStorage.removeItem('sb-drkhksdohtndsbbnxbfv-auth-token');
      localStorage.removeItem('supabase.auth.token');
      
      // Fazer logout no Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        throw error;
      }
      
      console.log("Logout realizado com sucesso");
    } catch (error) {
      console.error("Erro durante o processo de logout:", error);
      throw error;
    }
  };

  return { handleLogout };
};
