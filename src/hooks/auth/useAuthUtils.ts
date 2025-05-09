
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook utilitário para operações de autenticação comuns
 * que podem ser compartilhadas entre diferentes componentes
 */
export const useAuthUtils = () => {
  /**
   * Limpa dados de autenticação do localStorage e do estado
   * Usado principalmente durante o logout ou ao montar a página de login
   * quando o usuário não está autenticado
   */
  const clearAuthenticationData = async (shouldSignOut = true) => {
    try {
      // Limpar localStorage e cookies relacionados ao Supabase
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('supabase.auth.expires_at');
      
      // Tentar fazer logout no Supabase apenas se solicitado
      if (shouldSignOut) {
        try {
          await supabase.auth.signOut();
        } catch (error) {
          console.log("Erro ao tentar signOut do Supabase (ignorando):", error);
        }
      }
      
      console.log("Autenticação limpa", shouldSignOut ? "com signOut" : "sem signOut");
    } catch (error) {
      console.error("Erro ao limpar autenticação:", error);
      toast.error("Erro ao limpar dados de autenticação");
    }
  };

  return {
    clearAuthenticationData
  };
};
