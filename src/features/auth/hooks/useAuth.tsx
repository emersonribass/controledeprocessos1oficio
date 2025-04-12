
import React, { createContext, useContext, useState, useEffect } from "react";
import { AuthContextType, UserData } from "../types";
import { supabase } from "@/integrations/supabase/client";
import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";
import { useSession } from "./useSession";
import { isAdminByEmail } from "../utils/isAdminByEmail";
import { convertSupabaseUser } from "../utils/userConverter";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const { getSession, handleSessionChange } = useSession();
  const { handleLogin } = useLogin();
  const { handleLogout } = useLogout();

  // Função para verificar se um usuário é administrador
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
    const initAuth = async () => {
      setIsLoading(true);
      try {
        const session = await getSession();
        
        if (session?.user) {
          const userData = await convertSupabaseUser(session.user);
          setUser(userData);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    // Inicializar autenticação
    initAuth();

    // Configurar listener para mudanças de sessão
    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Evento de autenticação:", event);
      await handleSessionChange(event, session);
      
      if (session?.user) {
        const userData = await convertSupabaseUser(session.user);
        setUser(userData);
      } else {
        setUser(null);
      }
    });

    // Limpar listener ao desmontar
    return () => {
      authListener?.subscription?.unsubscribe();
    };
  }, []);

  // Construir o objeto de contexto
  const authContext: AuthContextType = {
    user,
    isLoading,
    login: (email: string, password: string) => handleLogin(email, password),
    logout: () => handleLogout(),
    isAdmin: checkAdminStatus,
    checkAdminStatus,
    updateUserPassword
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
