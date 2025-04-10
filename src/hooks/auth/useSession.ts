
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./userConverter";

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    console.log("[useSession] Inicializando gerenciamento de sessão");
    
    // Função para obter sessão inicial e configurar listener
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Primeiro configurar listener para mudanças de estado de autenticação
        // Isso deve ser feito antes de verificar a sessão atual
        console.log("[useSession] Configurando listener de autenticação");
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (_event, currentSession) => {
            console.log("[useSession] Evento de autenticação:", _event);
            
            // Atualizar o estado da sessão
            setSession(currentSession);
            
            // Processar dados do usuário de forma síncrona
            if (currentSession?.user) {
              console.log("[useSession] Sessão válida recebida do evento");
              // Usar setTimeout para evitar bloqueios na atualização do estado
              setTimeout(async () => {
                try {
                  console.log("[useSession] Convertendo dados do usuário");
                  const userData = await convertSupabaseUser(currentSession.user);
                  console.log("[useSession] Dados do usuário convertidos com sucesso");
                  setUser(userData);
                } catch (error) {
                  console.error("[useSession] Erro ao converter dados do usuário:", error);
                } finally {
                  setIsLoading(false);
                  setAuthInitialized(true);
                }
              }, 0);
            } else {
              console.log("[useSession] Nenhuma sessão válida no evento");
              setUser(null);
              setIsLoading(false);
              setAuthInitialized(true);
            }
          }
        );
        
        // Depois verificar se há uma sessão existente
        console.log("[useSession] Verificando sessão existente");
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("[useSession] Erro ao obter sessão:", sessionError);
          setIsLoading(false);
          setAuthInitialized(true);
          return () => subscription.unsubscribe();
        }
        
        console.log("[useSession] Sessão inicial:", sessionData.session ? "Existe" : "Não existe");
        
        // Se já temos uma sessão válida, podemos atualizar o estado do usuário diretamente
        if (sessionData.session?.user && !user) {
          console.log("[useSession] Processando sessão inicial existente");
          try {
            const userData = await convertSupabaseUser(sessionData.session.user);
            console.log("[useSession] Usuário da sessão inicial convertido com sucesso");
            setUser(userData);
            setSession(sessionData.session);
          } catch (error) {
            console.error("[useSession] Erro ao processar usuário da sessão inicial:", error);
          } finally {
            setIsLoading(false);
            setAuthInitialized(true);
          }
        } else if (!sessionData.session) {
          console.log("[useSession] Nenhuma sessão inicial encontrada");
          setIsLoading(false);
          setAuthInitialized(true);
        }
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("[useSession] Erro ao inicializar autenticação:", error);
        setIsLoading(false);
        setAuthInitialized(true);
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
      console.error("[useSession] Erro durante inicialização da autenticação:", error);
      setIsLoading(false);
      setAuthInitialized(true);
    });
    
    // Retorna a função de limpeza para useEffect
    return () => {
      console.log("[useSession] Limpando listeners de autenticação");
      cleanupFunction();
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    authInitialized,
    setUser,
    setSession,
    setIsLoading
  };
};
