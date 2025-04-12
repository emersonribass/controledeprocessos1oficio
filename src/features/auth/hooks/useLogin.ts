
import { supabase } from "@/integrations/supabase/client";

export const useLogin = () => {
  const handleLogin = async (email: string, password: string) => {
    try {
      console.log(`Tentando fazer login para o usuário: ${email}`);
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
      return { session: data.session, error: null };
    } catch (error) {
      console.error("Erro durante o processo de login:", error);
      return { session: null, error };
    }
  };

  return { handleLogin };
};
