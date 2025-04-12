
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export const useSession = () => {
  // Função para obter a sessão atual
  const getSession = async (): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      if (error) {
        throw error;
      }
      return data?.session || null;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    }
  };

  // Função para lidar com mudanças na sessão
  const handleSessionChange = async (
    event: string,
    session: Session | null
  ) => {
    console.log(`Evento de autenticação: ${event}`, session);
    
    if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
      // Atualização após login ou atualização de token
      return session;
    } else if (event === 'SIGNED_OUT') {
      // Limpar qualquer estado após logout
      return null;
    }
    
    return session;
  };

  return { getSession, handleSessionChange };
};
