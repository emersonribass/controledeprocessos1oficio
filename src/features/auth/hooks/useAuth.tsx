
import React, { createContext, useContext, useState, useEffect, useRef } from "react";
import { AuthContextType, UserData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";
import { isAdminByEmail } from "../utils/isAdminByEmail";
import { convertSupabaseUser } from "../utils/userConverter";
import { Session } from "@supabase/supabase-js";
import { toast } from "sonner";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const authInitialized = useRef(false);
  const [session, setSession] = useState<Session | null>(null);

  // Hooks para login e logout
  const { handleLogin } = useLogin();
  const { handleLogout } = useLogout();

  // Verificar se um usuário é administrador
  const checkAdminStatus = async (email: string): Promise<boolean> => {
    return await isAdminByEmail(email);
  };

  // Atualizar senha do usuário
  const updateUserPassword = async (newPassword: string): Promise<{ success: boolean; error: any }> => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (error) throw error;

      return { success: true, error: null };
    } catch (error) {
      console.error('Erro ao atualizar senha:', error);
      return { success: false, error };
    }
  };

  // Sincronizar o estado do usuário com a sessão do Supabase
  useEffect(() => {
    if (authInitialized.current) return;
    
    let isMounted = true;
    authInitialized.current = true;
    
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Configurar listener para mudanças de sessão
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, currentSession) => {
          console.log("Evento de autenticação:", event);
          
          if (!isMounted) return;
          
          setSession(currentSession);
          
          // Processar dados do usuário de forma assíncrona
          if (currentSession?.user) {
            try {
              const userData = await convertSupabaseUser(currentSession.user);
              if (isMounted) setUser(userData);
            } catch (error) {
              console.error("Erro ao converter dados do usuário:", error);
              if (isMounted) setUser(null);
            }
          } else {
            if (isMounted) setUser(null);
          }
          
          if (isMounted) setIsLoading(false);
        });
        
        // Verificar sessão atual
        const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          console.error("Erro ao obter sessão:", sessionError);
          if (isMounted) {
            setUser(null);
            setSession(null);
            setIsLoading(false);
          }
          return () => subscription.unsubscribe();
        }
        
        // Atualizar estado com a sessão atual
        if (sessionData.session && isMounted) {
          setSession(sessionData.session);
          const userData = await convertSupabaseUser(sessionData.session.user);
          setUser(userData);
        }
        
        // Garantir que isLoading seja definido como false
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
    
    // Executar inicialização
    const cleanupPromise = initAuth();
    
    // Função de limpeza
    return () => {
      isMounted = false;
      cleanupPromise.then(cleanup => {
        if (cleanup && typeof cleanup === 'function') {
          cleanup();
        }
      });
    };
  }, []);

  // Função login
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const result = await handleLogin(email, password);
      
      if (result.error) {
        throw result.error;
      }
      
      if (!result.session) {
        throw new Error("Não foi possível obter uma sessão válida");
      }
      
      // O estado será atualizado pelo onAuthStateChange
      toast.success("Login efetuado com sucesso!", {
        description: "Bem-vindo de volta!",
        duration: 3000
      });
      
      return { 
        user: user, 
        session: result.session, 
        weakPassword: false 
      };
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Função logout
  const logout = async () => {
    setIsLoading(true);
    try {
      await handleLogout();
      // O estado será atualizado pelo onAuthStateChange
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      setIsLoading(false);
      throw error;
    }
  };

  // Construir o objeto de contexto
  const authContext: AuthContextType = {
    user,
    isLoading,
    login,
    logout,
    isAdmin: checkAdminStatus,
    checkAdminStatus,
    updateUserPassword,
    session
  };

  return (
    <AuthContext.Provider value={authContext}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  
  return context;
};
