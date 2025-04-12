
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useLogin = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log(`Tentando fazer login para o usuário: ${email}`);
      
      // Limpar qualquer sessão anterior que possa estar causando problemas
      try {
        await supabase.auth.signOut({ scope: 'local' });
      } catch (err) {
        // Ignorar erros ao tentar fazer signOut
        console.log("Erro ao limpar sessão anterior:", err);
      }
      
      // Esperar um momento antes de tentar fazer login
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro ao fazer login:", error);
        let message = "Erro ao fazer login.";
        
        if (error.message.includes("Invalid login credentials")) {
          message = "Credenciais inválidas. Verifique seu e-mail e senha.";
        } else if (error.message.includes("Email not confirmed")) {
          message = "Email não confirmado. Verifique sua caixa de entrada.";
        }
        
        throw new Error(message);
      }

      console.log("Login bem-sucedido:", data);
      
      // Verificar se realmente recebemos dados de sessão válidos
      if (!data.session) {
        throw new Error("Não foi possível obter uma sessão válida");
      }
      
      return { session: data.session, error: null };
    } catch (error) {
      console.error("Erro durante o processo de login:", error);
      return { session: null, error };
    }
  };

  return { handleLogin };
};
