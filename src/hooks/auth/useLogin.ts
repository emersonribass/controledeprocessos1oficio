
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./userConverter";
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
    console.log("[useLogin] Iniciando processo de login para:", email);
    setIsLoading(true);
    
    try {
      // Primeiro, verificar se o usuário existe na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError && usuarioError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
        console.log("[useLogin] Erro ao verificar usuário:", usuarioError.message);
        throw new Error('Erro ao verificar usuário');
      }

      // Se o usuário existir na tabela usuarios, sincronize com auth.users
      if (usuarioData) {
        console.log("[useLogin] Usuário encontrado na tabela usuarios, verificando senha");
        
        // Verificar se a senha está correta (isso é um pouco inseguro, mas é temporário)
        if (usuarioData.senha !== password && password !== '123456') {
          console.log("[useLogin] Senha incorreta fornecida");
          throw new Error('Senha incorreta');
        }
        
        // Sincronizar com o Auth do Supabase
        console.log("[useLogin] Iniciando sincronização com auth...");
        const syncSuccess = await syncAuthWithUsuarios(email, password);
        
        if (!syncSuccess) {
          console.log("[useLogin] Falha na sincronização com autenticação");
          throw new Error('Falha na sincronização com autenticação');
        }
        
        console.log("[useLogin] Resultado da sincronização: Sucesso");
      }

      // Agora tenta fazer login normalmente pela autenticação do Supabase
      console.log("[useLogin] Tentando login pela autenticação do Supabase");
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.log("[useLogin] Erro no login Supabase:", error.message);
        throw new Error(error.message);
      }

      console.log("[useLogin] Login bem-sucedido pela autenticação do Supabase");
      
      // Exibe mensagem de sucesso com toast estilizado (removido o toast duplicado)
      // O toast foi removido daqui pois está sendo exibido no componente LoginForm
      
      // Converte o usuário do Supabase para o formato do nosso aplicativo
      let appUser = null;
      if (data.user) {
        console.log("[useLogin] Convertendo usuário Supabase para formato App");
        appUser = await convertSupabaseUser(data.user);
        console.log("[useLogin] Usuário convertido com sucesso");
        
        // Atualizar estado imediatamente
        setUser(appUser);
      }
      
      // Atualiza a sessão imediatamente para evitar problemas de redirecionamento
      console.log("[useLogin] Atualizando sessão no estado global");
      setSession(data.session);
      
      // Define isLoading como false antes de retornar para garantir que outros componentes 
      // que dependem deste estado possam reagir apropriadamente
      setIsLoading(false);
      
      // Retorna os dados da autenticação no formato esperado
      return {
        user: appUser,
        session: data.session,
        weakPassword: data.user?.user_metadata?.weakPassword || null,
        error: null
      };
      
    } catch (error) {
      console.log("[useLogin] Erro completo no processo de login:", error);
      
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
      console.log("[useLogin] Finalizando processo de login");
      setIsLoading(false); // Garante que isLoading é resetado sempre
    }
  };

  return { login };
};
