
import LoginForm from "@/components/Auth/LoginForm";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const LoginPage = () => {
  const {
    user,
    isLoading
  } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

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
      <div className="flex flex-col items-center mb-10">
        <img 
          src="/Logo Nottar vertical.png" 
          alt="Logo Nottar" 
          className="mx-auto h-40 w-auto object-scale-down"
        />
        <h1 className="text-2xl font-bold text-amber-950 mt-4">Sistema Nottar</h1>
        <p className="text-muted-foreground text-center">Gestão de Processos</p>
      </div>
      
      <LoginForm />
      
      <div className="mt-8 text-sm text-muted-foreground text-center">
        <p>&copy; {new Date().getFullYear()} Nottar. Todos os direitos reservados.</p>
      </div>
    </div>
  );
};

export default LoginPage;
