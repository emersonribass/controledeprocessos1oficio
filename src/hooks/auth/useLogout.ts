
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

      // Verifica se existe uma sessão antes de tentar fazer logout
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Se não há sessão, apenas limpa o estado local
        setUser(null);
        setSession(null);
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
        toast.error("Erro ao encerrar sessão", {
          duration: 4000,
          important: true,
        });
      } else {
        // Limpar o estado local mesmo se houver erro no supabase.auth.signOut()
        setUser(null);
        setSession(null);
        toast.info("Sessão encerrada com sucesso", {
          duration: 3000,
          important: true,
        });
      }
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão", {
        duration: 4000,
        important: true,
      });
    } finally {
      setIsLoading(false); // Garantir que isLoading volta para false em qualquer caso
    }
  };

  return { logout };
};
