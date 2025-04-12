
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import AuthLoginForm from "@/features/auth/components/AuthLoginForm";

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
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.refreshToken');
      localStorage.removeItem('sb-drkhksdohtndsbbnxbfv-auth-token');
      localStorage.removeItem('sb-refresh-token');
      localStorage.removeItem('supabase.auth.expires_at');
      console.log("Login: Tokens de autenticação limpos ao montar componente");
    };
    
    clearLocalStorageAuth();
  }, []);

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
      <AuthLoginForm />
    </div>
  );
};

export default LoginPage;
