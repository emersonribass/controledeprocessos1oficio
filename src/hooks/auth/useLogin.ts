
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./userConverter";
import { toast } from "sonner";
import { LoginResult } from "./types";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";

type UseLoginProps = {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export const useLogin = ({ setUser, setSession, setIsLoading }: UseLoginProps) => {
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      console.log("Iniciando processo de login para:", email);
      
      // Tentativa de autenticação direta pelo Supabase Auth
      console.log("Tentando autenticação no Supabase Auth");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro ao fazer login no Supabase Auth:", error);
        throw new Error(error.message);
      }

      // Exibe mensagem de sucesso com toast estilizado
      toast.success("Login realizado com sucesso!", {
        duration: 3000,
        important: true,
      });
      
      // Converte o usuário do Supabase para o formato do nosso aplicativo
      let appUser = null;
      if (data.user) {
        console.log("Login bem-sucedido, convertendo usuário");
        appUser = await convertSupabaseUser(data.user);
        setUser(appUser);
      }
      
      // Atualiza a sessão imediatamente para evitar problemas de redirecionamento
      setSession(data.session);
      
      // Retorna os dados da autenticação no formato esperado
      return {
        user: appUser,
        session: data.session,
        weakPassword: data.user?.user_metadata?.weakPassword || null,
        error: null
      };
      
    } catch (error) {
      console.error("Erro completo no processo de login:", error);
      
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 4000,
          important: true,
        });
      } else {
        toast.error("Erro ao realizar login", {
          duration: 4000,
          important: true,
        });
      }
      setIsLoading(false); // Garantir que isLoading volta para false em caso de erro
      
      return {
        user: null,
        session: null,
        weakPassword: null,
        error: error instanceof Error ? error : new Error("Erro desconhecido ao fazer login")
      };
    } finally {
      setIsLoading(false);
    }
  };

  return { login };
};
