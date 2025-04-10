
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";

const LoginPage = () => {
  const {
    user,
    isLoading,
    authInitialized,
    setUser,
    setSession
  } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const [isLoginAttempt, setIsLoginAttempt] = useState(false);
  const [skipCleanup, setSkipCleanup] = useState(false);

  // Limpar localStorage de autenticação e estados ao montar o componente de login,
  // mas não durante uma tentativa de login ou após login bem-sucedido
  useEffect(() => {
    // Não limpar autenticação se estiver em uma tentativa de login ou se devemos pular a limpeza
    if (isLoginAttempt || skipCleanup) {
      console.log("LoginPage: Ignorando limpeza de autenticação (tentativa de login ativa ou redirecionamento em andamento)");
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
  }, [setUser, setSession, isLoginAttempt, skipCleanup]);

  // Efeito para redirecionamento após autenticação bem-sucedida
  useEffect(() => {
    // Aguardar a inicialização completa da autenticação
    if (!authInitialized) {
      console.log("LoginPage: Autenticação ainda não inicializada");
      return;
    }

    // Evitar redirecionamentos múltiplos
    if (hasRedirected) {
      console.log("LoginPage: Já redirecionou, ignorando");
      return;
    }

    // Se ainda estiver carregando, não faça nada
    if (isLoading) {
      console.log("LoginPage: Autenticação carregando...");
      return;
    }

    if (user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      setSkipCleanup(true); // Impedir limpeza durante redirecionamento
      
      // Redirecionamento imediato para o dashboard
      navigate("/dashboard", {
        replace: true
      });
    }
  }, [user, isLoading, navigate, hasRedirected, authInitialized]);

  if (isLoading) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted/40 to-background">
      <LoginForm 
        onLoginAttempt={setIsLoginAttempt} 
        onLoginSuccess={() => setSkipCleanup(true)}
      />
    </div>
  );
};

export default LoginPage;
