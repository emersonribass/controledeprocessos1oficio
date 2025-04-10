
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./utils";

export const useSession = () => {
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

  return {
    user,
    session,
    isLoading,
    setUser,
    setSession,
    setIsLoading
  };
};
