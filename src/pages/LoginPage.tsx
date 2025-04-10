
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const {
    user,
    isLoading,
    setUser,
    setSession
  } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isLoginAttempt, setIsLoginAttempt] = useState(false);

  // Limpar localStorage de autenticação e estados ao montar o componente de login
  useEffect(() => {
    // Não limpar autenticação se estiver em uma tentativa de login
    if (isLoginAttempt) {
      console.log("LoginPage: Tentativa de login em andamento, não limpando autenticação");
      return;
    }

    const clearAuthentication = async () => {
      try {
        console.log("LoginPage: Iniciando limpeza de autenticação");
        
        // Limpar localStorage e cookies relacionados ao Supabase
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('supabase.auth.expires_at');
        
        // Tentar fazer logout no Supabase (ignorando erros se não houver sessão)
        try {
          await supabase.auth.signOut();
          console.log("LoginPage: Logout Supabase realizado com sucesso");
        } catch (error) {
          console.log("LoginPage: Erro ao tentar signOut do Supabase (ignorando):", error);
        }
        
        // Limpar estados de autenticação no contexto
        setUser?.(null);
        setSession?.(null);
        
        console.log("LoginPage: Autenticação limpa ao montar componente");
      } catch (error) {
        console.error("LoginPage: Erro ao limpar autenticação:", error);
      }
    };
    
    clearAuthentication();
  }, [setUser, setSession, isLoginAttempt]);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) return;
    if (!isLoading && user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      navigate("/dashboard", {
        replace: true
      });
    }
  }, [user, isLoading, navigate, hasRedirected]);

  if (isLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted/40 to-background">
      <LoginForm onLoginAttempt={setIsLoginAttempt} />
    </div>
  );
};

export default LoginPage;
