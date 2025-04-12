
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import AuthLoginForm from "@/features/auth/components/LoginForm";
import { ErrorBoundary } from "@/components/ErrorBoundary/ErrorBoundary";
import { toast } from "sonner";

const LoginPage = () => {
  const {
    user,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  // Limpar localStorage de autenticação ao montar o componente de login
  useEffect(() => {
    const clearLocalStorageAuth = () => {
      try {
        // Não apagamos os tokens aqui, deixamos o gerenciamento para o Supabase Auth
        console.log("Login: Componente montado");
      } catch (error) {
        console.error("Erro ao acessar localStorage:", error);
      }
    };
    
    clearLocalStorageAuth();
  }, []);

  // Redirecionar se o usuário já estiver autenticado
  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) return;
    
    // Se ainda estiver carregando, aguarde
    if (isLoading) {
      console.log("LoginPage: Ainda carregando autenticação...");
      return;
    }
    
    try {
      console.log("LoginPage: Verificando autenticação, usuário:", !!user);
      
      if (user) {
        console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
        setHasRedirected(true);
        navigate("/dashboard", { replace: true });
      }
    } catch (error) {
      console.error("Erro ao tentar redirecionar:", error);
      toast.error("Erro ao navegar", {
        description: "Não foi possível redirecionar para o dashboard.",
      });
    }
  }, [user, isLoading, navigate, hasRedirected]);

  // Mostrar indicador de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30" role="status" aria-live="polite">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" aria-hidden="true"></div>
        <span className="mt-2">Carregando...</span>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-muted/40 to-background"
      role="main"
      aria-labelledby="login-heading"
    >
      <h1 id="login-heading" className="sr-only">Login para o Sistema de Controle de Processos</h1>
      <ErrorBoundary
        onError={(error) => {
          toast.error("Erro na autenticação", {
            description: "Ocorreu um erro ao tentar autenticar. Por favor, tente novamente.",
          });
        }}
      >
        <AuthLoginForm />
      </ErrorBoundary>
    </div>
  );
};

export default LoginPage;
