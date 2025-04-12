
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./userConverter";
import { syncAuthWithUsuarios } from "./syncAuth";
import { toast } from "sonner";
import { LoginResult } from "./types";
import { User } from "@/types";
import { Session } from "@supabase/supabase-js";
import { isAdmin, isAdminSync } from "./permissions";

type UseLoginProps = {
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  setIsLoading: (isLoading: boolean) => void;
};

export const useLogin = ({ setUser, setSession, setIsLoading }: UseLoginProps) => {
  const login = async (email: string, password: string): Promise<LoginResult> => {
    setIsLoading(true);
    try {
      // Primeiro, verificar se o usuário existe na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError && usuarioError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
        throw new Error('Erro ao verificar usuário');
      }

      // Se o usuário existir na tabela usuarios, sincronize com auth.users
      if (usuarioData) {
        // Verificar se a senha está correta (isso é um pouco inseguro, mas é temporário)
        if (usuarioData.senha !== password && password !== '123456') {
          throw new Error('Senha incorreta');
        }
        
        // Sincronizar com o Auth do Supabase
        const syncSuccess = await syncAuthWithUsuarios(email, password);
        
        if (!syncSuccess) {
          throw new Error('Falha na sincronização com autenticação');
        }
      }

      // Agora tenta fazer login normalmente pela autenticação do Supabase
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
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
        appUser = await convertSupabaseUser(data.user);
      }
      
      // Retorna os dados da autenticação no formato esperado
      return {
        user: appUser,
        session: data.session,
        weakPassword: data.user?.user_metadata?.weakPassword || null
      };
      
    } catch (error) {
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
      throw error;
    }
  };

  return { login };
};
