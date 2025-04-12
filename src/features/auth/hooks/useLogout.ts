
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogout = () => {
  const handleLogout = async () => {
    try {
      console.log("Iniciando processo de logout");
      
      // Verificar se existe uma sessão antes de tentar fazer logout
      const { data: sessionData } = await supabase.auth.getSession();
      
      if (!sessionData.session) {
        // Se não há sessão, apenas informar que já está deslogado
        toast.info("Você já está desconectado", {
          duration: 3000,
          important: true,
        });
        return;
      }
      
      // Se existe sessão, faz logout normalmente
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error("Erro ao fazer logout:", error);
        toast.error("Erro ao encerrar sessão", {
          description: error.message,
          duration: 4000,
          important: true,
        });
      } else {
        // Logout bem-sucedido
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
      throw error;
    }
  };

  return { handleLogout };
};
