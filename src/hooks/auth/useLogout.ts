
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

type UseLogoutProps = {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export const useLogout = ({ setUser, setSession, setIsLoading }: UseLogoutProps) => {
  const logout = async () => {
    try {
      setIsLoading(true);

      // Verificar se existe uma sessão antes de tentar fazer logout
      const { data: sessionData } = await supabase.auth.getSession();
      
      // Independentemente de haver sessão válida ou não, limpa o estado local primeiro
      setUser(null);
      setSession(null);
      
      if (!sessionData.session) {
        // Se não há sessão, apenas limpar qualquer vestígio de autenticação
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
        
        toast.info("Sessão encerrada", {
          duration: 3000,
          important: true,
        });
        
        setIsLoading(false);
        return;
      }
      
      // Se existe sessão, faz logout normalmente
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        
        // Mesmo com erro, limpar o localStorage para garantir que o usuário seja deslogado
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
        
        toast.warning("Logout realizado com notificação de erro", {
          description: "Sua sessão foi encerrada, mas ocorreu um erro no processo.",
          duration: 4000,
          important: true,
        });
      } else {
        toast.info("Sessão encerrada com sucesso", {
          duration: 3000,
          important: true,
        });
      }
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      
      // Mesmo com erro, limpar o estado e localStorage para garantir logout efetivo
      setUser(null);
      setSession(null);
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
      
      toast.warning("Sessão encerrada com erro", {
        description: "Sua sessão foi encerrada, mas ocorreu um erro no processo.",
        duration: 4000,
        important: true,
      });
    } finally {
      setIsLoading(false); // Garantir que isLoading volta para false em qualquer caso
    }
  };

  return { logout };
};
