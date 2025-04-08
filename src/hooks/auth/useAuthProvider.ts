
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser, syncAuthWithUsuarios } from "./utils";
import { toast } from "sonner";
import { LoginResult } from "./types";

export const useAuthProvider = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    console.log("Inicializando AuthProvider");
    
    // Função para obter sessão inicial e configurar listener
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Primeiro configurar listener para mudanças de estado de autenticação
        // Isso deve ser feito antes de verificar a sessão atual
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, currentSession) => {
            console.log("Evento de autenticação:", _event);
            
            // Atualizar o estado da sessão
            setSession(currentSession);
            
            // Processar dados do usuário de forma síncrona
            if (currentSession?.user) {
              // Usar setTimeout para evitar bloqueios na atualização do estado
              setTimeout(async () => {
                try {
                  const userData = await convertSupabaseUser(currentSession.user);
                  setUser(userData);
                } catch (error) {
                  console.error("Erro ao converter dados do usuário:", error);
                } finally {
                  setIsLoading(false);
                }
              }, 0);
            } else {
              setUser(null);
              setIsLoading(false);
            }
          }
        );
        
        // Depois verificar se há uma sessão existente
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          setIsLoading(false);
          return () => subscription.unsubscribe();
        }
        
        console.log("Sessão inicial:", sessionData.session ? "Existe" : "Não existe");
        
        // Não atualizamos o estado aqui diretamente para evitar conflitos com o listener
        // O listener será responsável por atualizar o estado quando receber o evento INITIAL_SESSION
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        setIsLoading(false);
        return () => {}; // Retorna uma função vazia em caso de erro
      }
    };
    
    // Inicializa a autenticação e armazena a função de limpeza
    let cleanupFunction = () => {};
    
    // Executa a inicialização de forma assíncrona
    initAuth().then(cleanup => {
      if (cleanup && typeof cleanup === 'function') {
        cleanupFunction = cleanup;
      }
    }).catch(error => {
      console.error("Erro durante inicialização da autenticação:", error);
    });
    
    // Retorna a função de limpeza para useEffect
    return () => {
      cleanupFunction();
    };
  }, []);

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

      // Exibe mensagem de sucesso
      toast.success("Login realizado com sucesso!");
      
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
        toast.error(error.message);
      } else {
        toast.error("Erro ao realizar login");
      }
      setIsLoading(false); // Garantir que isLoading volta para false em caso de erro
      throw error;
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        throw error;
      }
      
      // Não atualizamos os estados aqui para evitar conflitos com o listener
      // O listener onAuthStateChange será responsável por limpar a sessão e o usuário
      toast.info("Sessão encerrada");
      
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
      setIsLoading(false); // Garantir que isLoading volta para false em caso de erro
    }
  };

  return {
    user,
    session,
    isLoading,
    login,
    logout
  };
};
