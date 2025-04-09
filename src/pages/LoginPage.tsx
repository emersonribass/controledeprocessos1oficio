
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const LoginPage = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) return;
    
    if (!isLoading && user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      navigate("/dashboard", { replace: true });
    }
  }, [user, isLoading, navigate, hasRedirected]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-muted/30">
      <div className="mb-8 text-center">
        <img 
          src="/Logo Nottar vertical.svg" 
          alt="Nottar Logo" 
          className="mx-auto mb-2 h-24 w-auto" 
          onError={(e) => {
            console.error("Erro ao carregar logo:", e);
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/placeholder.svg";
          }}
        />
        <p className="text-muted-foreground">Sistema de Gestão de Processos</p>
      </div>
      
      <LoginForm />
    </div>
  );
};

export default LoginPage;
