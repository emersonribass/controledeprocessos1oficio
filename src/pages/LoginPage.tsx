
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
  const [hasCheckedAuth, setHasCheckedAuth] = useState(false);

  // Verificar autenticação e redirecionar se necessário
  useEffect(() => {
    // Se ainda está carregando, não faz nada
    if (isLoading) {
      console.log("LoginPage: Ainda carregando autenticação...");
      return;
    }
    
    // Marca que já verificamos a autenticação
    setHasCheckedAuth(true);
    
    // Se o usuário está autenticado, redireciona para o dashboard
    if (user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate]);

  // Adicionando um timeout de segurança para evitar spinner infinito
  useEffect(() => {
    // Se não conseguimos carregar os dados de autenticação em 5 segundos, 
    // assumimos que não há sessão ativa
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        console.log("LoginPage: Timeout de carregamento atingido, forçando estado de não-autenticado");
        setHasCheckedAuth(true);
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  // Mostrar indicador de carregamento apenas por um período razoável
  if (isLoading && !hasCheckedAuth) {
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
