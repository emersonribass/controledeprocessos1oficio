
import { useState, useEffect } from "react";
import { Session } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { convertSupabaseUser } from "./utils";

export const useSession = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [authInitialized, setAuthInitialized] = useState(false);

  useEffect(() => {
    if (authInitialized) return; // Execute apenas uma vez
    
    console.log("[useSession] Inicializando gerenciamento de sessão");
    
    // Primeiro configurar listener para mudanças de estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, currentSession) => {
        console.log("[useSession] Evento de autenticação:", event);
        
        // Atualizar o estado da sessão
        setSession(currentSession);
        
        // Processar dados do usuário
        if (currentSession?.user) {
          try {
            const userData = await convertSupabaseUser(currentSession.user);
            console.log("[useSession] Usuário autenticado:", userData.email);
            setUser(userData);
          } catch (error) {
            console.error("[useSession] Erro ao converter dados do usuário:", error);
            setUser(null);
          }
        } else {
          console.log("[useSession] Nenhum usuário na sessão");
          setUser(null);
        }
        
        setIsLoading(false);
      }
    );
    
    // Verificar sessão existente
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("[useSession] Erro ao buscar sessão:", error);
          setIsLoading(false);
          return;
        }
        
        if (data.session) {
          console.log("[useSession] Sessão existente encontrada");
          setSession(data.session);
          
          try {
            const userData = await convertSupabaseUser(data.session.user);
            console.log("[useSession] Dados do usuário carregados:", userData.email);
            setUser(userData);
          } catch (error) {
            console.error("[useSession] Erro ao converter dados do usuário:", error);
          }
        } else {
          console.log("[useSession] Nenhuma sessão existente");
        }
      } catch (error) {
        console.error("[useSession] Erro ao verificar sessão:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
    setAuthInitialized(true);
    
    return () => {
      subscription.unsubscribe();
    };
  }, [authInitialized]);

  return {
    user,
    session,
    isLoading,
    setUser,
    setSession,
    setIsLoading
  };
};
