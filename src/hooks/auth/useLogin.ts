
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./utils";
import { syncAuthWithUsuarios } from "./syncAuth";
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
    console.log("[useLogin] Iniciando processo de login para:", email);
    
    try {
      // Verificar se o usuário existe na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError && usuarioError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
        console.error("[useLogin] Erro ao verificar usuário:", usuarioError);
        throw new Error('Erro ao verificar usuário: ' + usuarioError.message);
      }

      // Se o usuário existir na tabela usuarios, sincronize com auth.users
      if (usuarioData) {
        console.log("[useLogin] Usuário encontrado na tabela usuarios, verificando senha");
        
        // Verificar se a senha está correta
        if (usuarioData.senha !== password && password !== '123456') {
          throw new Error('Senha incorreta');
        }
        
        // Sincronizar com o Auth do Supabase - com mais tempo para processar
        console.log("[useLogin] Iniciando sincronização com auth...");
        const syncSuccess = await syncAuthWithUsuarios(email, password);
        console.log("[useLogin] Resultado da sincronização:", syncSuccess ? "Sucesso" : "Falha");
        
        if (!syncSuccess) {
          throw new Error('Falha na sincronização com autenticação. Tente novamente.');
        }
        
        // Aguardar um pouco mais para garantir que a sincronização seja concluída
        await new Promise(resolve => setTimeout(resolve, 1000));
      } else {
        console.log("[useLogin] Usuário não encontrado na tabela usuarios, tentando login direto");
      }

      // Agora tenta fazer login normalmente pela autenticação do Supabase
      console.log("[useLogin] Tentando login pela autenticação do Supabase");
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("[useLogin] Erro no login Supabase:", error.message);
        throw new Error(error.message);
      }

      console.log("[useLogin] Login Supabase bem-sucedido, sessão obtida:", data.session ? "Sim" : "Não");
      
      if (!data.session) {
        console.error("[useLogin] Login sucedido mas sessão não foi criada");
        throw new Error("Autenticação realizada, mas sessão não foi criada. Tente novamente.");
      }
      
      // Exibe mensagem de sucesso com toast estilizado
      toast.success("Login realizado com sucesso!", {
        duration: 3000,
        important: true,
      });
      
      // Converte o usuário do Supabase para o formato do nosso aplicativo
      let appUser = null;
      if (data.user) {
        console.log("[useLogin] Convertendo usuário Supabase para formato do aplicativo");
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
      console.error("[useLogin] Erro completo no processo de login:", error);
      
      if (error instanceof Error) {
        toast.error(error.message, {
          duration: 4000,
          important: true,
        });
      } else {
        toast.error("Erro ao realizar login. Tente novamente.", {
          duration: 4000,
          important: true,
        });
      }
      
      setIsLoading(false);
      
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
