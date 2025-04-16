
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { useAuthUtils } from "@/hooks/auth/useAuthUtils";

const LoginPage = () => {
  const {
    user,
    isLoading,
    setUser,
    setSession
  } = useAuth();
  const { clearAuthenticationData } = useAuthUtils();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);
  const isSuccessfulLogin = useRef(false);

  // Limpar localStorage de autenticação e estados ao montar o componente de login
  // mas apenas se não tivermos acabado de fazer login com sucesso
  useEffect(() => {
    // Não limpar a autenticação se o componente for desmontado devido a um login bem-sucedido
    if (!isSuccessfulLogin.current) {
      const clearAuthentication = async () => {
        // Definir setUser e setSession como null apenas se não estivermos em processo de login
        await clearAuthenticationData(false); // Não chamar signOut do Supabase
        setUser?.(null);
        setSession?.(null);
        
        console.log("Login: Autenticação limpa ao montar componente");
      };
      
      clearAuthentication();
    }
    
    // Não queremos executar a limpeza durante o desmonte se tivermos feito login com sucesso
    return () => {
      console.log("LoginPage desmontando, login bem-sucedido:", isSuccessfulLogin.current);
    };
  }, [setUser, setSession, clearAuthenticationData]);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) return;
    
    if (!isLoading && user) {
      console.log("LoginPage: Usuário já autenticado, redirecionando para /dashboard");
      isSuccessfulLogin.current = true; // Marcar como login bem-sucedido
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
      <LoginForm />
    </div>
  );
};

export default LoginPage;
