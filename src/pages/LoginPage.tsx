
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
  const [clearingAuth, setClearingAuth] = useState(true);

  // Limpar localStorage de autenticação e estados ao montar o componente de login
  useEffect(() => {
    const clearAuthentication = async () => {
      try {
        setClearingAuth(true);
        console.log("[LoginPage] Iniciando limpeza de autenticação");
        
        // Limpar localStorage e cookies relacionados ao Supabase
        localStorage.removeItem('supabase.auth.token');
        localStorage.removeItem('supabase.auth.refreshToken');
        localStorage.removeItem('sb-vwijryhqngyzgpgekgek-auth-token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('supabase.auth.expires_at');
        
        // Tentar fazer logout no Supabase (ignorando erros se não houver sessão)
        try {
          await supabase.auth.signOut();
          console.log("[LoginPage] Logout Supabase realizado com sucesso");
        } catch (error) {
          console.log("[LoginPage] Erro ao tentar signOut do Supabase (ignorando):", error);
        }
        
        // Limpar estados de autenticação no contexto
        setUser?.(null);
        setSession?.(null);
        
        console.log("[LoginPage] Autenticação limpa ao montar componente");
      } catch (error) {
        console.error("[LoginPage] Erro ao limpar autenticação:", error);
      } finally {
        setClearingAuth(false);
      }
    };
    
    clearAuthentication();
  }, [setUser, setSession]);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos e só redirecionar após limpeza de auth
    if (hasRedirected || clearingAuth) return;
    
    if (!isLoading && user) {
      console.log("[LoginPage] Usuário já autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      
      // Adicionar um pequeno atraso para garantir que o estado seja atualizado antes do redirecionamento
      setTimeout(() => {
        navigate("/dashboard", {
          replace: true
        });
      }, 500);
    }
  }, [user, isLoading, navigate, hasRedirected, clearingAuth]);

  if (isLoading || clearingAuth) {
    return <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <p className="mt-4 text-muted-foreground">
          {clearingAuth ? "Preparando ambiente de login..." : "Carregando..."}
        </p>
      </div>;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted/40 to-background">
      <LoginForm />
    </div>
  );
};

export default LoginPage;
