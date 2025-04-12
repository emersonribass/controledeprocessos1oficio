
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { convertSupabaseUser } from "../utils/userConverter";
import { UserData } from "../types";

export const useSession = () => {
  const [user, setUser] = useState<UserData | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para obter a sessão atual
  const getSession = async (): Promise<Session | null> => {
    try {
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Erro ao obter sessão:", error);
        return null;
      }
      
      return data.session;
    } catch (error) {
      console.error("Erro ao obter sessão:", error);
      return null;
    }
  };

  // Função para lidar com mudanças de estado de autenticação
  const handleSessionChange = async (event: string, currentSession: Session | null) => {
    console.log(`Evento de autenticação: ${event}`);
    
    if (currentSession) {
      console.log("Sessão encontrada, atualizando estado");
      setSession(currentSession);
      
      try {
        const userData = await convertSupabaseUser(currentSession.user);
        setUser(userData);
      } catch (error) {
        console.error("Erro ao converter dados do usuário:", error);
        setUser(null);
      }
    } else {
      console.log("Nenhuma sessão encontrada, limpando estado");
      setUser(null);
      setSession(null);
    }
  };

  // Inicializar e configurar o listener de autenticação
  useEffect(() => {
    console.log("Inicializando useSession...");
    let isMounted = true;
    
    // Função para configurar listener e verificar sessão existente
    const initAuth = async () => {
      setIsLoading(true);
      
      try {
        // Primeiro configurar listener para mudanças no estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          (event, currentSession) => {
            console.log("Evento de autenticação recebido:", event);
            
            // Usar setTimeout para evitar problemas de deadlock
            setTimeout(async () => {
              if (isMounted) {
                await handleSessionChange(event, currentSession);
                setIsLoading(false);
              }
            }, 0);
          }
        );
        
        // Depois verificar sessão atual
        const currentSession = await getSession();
        
        // Atualizar estado com a sessão existente
        if (isMounted && currentSession) {
          setSession(currentSession);
          const userData = await convertSupabaseUser(currentSession.user);
          setUser(userData);
        }
        
        // Garantir que isLoading seja definido como false mesmo se não houver sessão
        if (isMounted) {
          setIsLoading(false);
        }
        
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        
        if (isMounted) {
          setUser(null);
          setSession(null);
          setIsLoading(false);
        }
        
        return () => {};
      }
    };
    
    // Inicializar autenticação
    const cleanup = initAuth();
    
    return () => {
      isMounted = false;
      cleanup.then(unsubscribe => {
        if (unsubscribe && typeof unsubscribe === 'function') {
          unsubscribe();
        }
      });
    };
  }, []);

  return {
    user,
    session,
    isLoading,
    setUser,
    setSession,
    setIsLoading,
    getSession,
    handleSessionChange
  };
};
