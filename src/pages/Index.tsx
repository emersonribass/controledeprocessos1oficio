
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, isLoading, authInitialized } = useAuth();
  const navigate = useNavigate();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    // Evitar redirecionamentos múltiplos
    if (hasRedirected) {
      console.log("Index: Já redirecionou, ignorando");
      return;
    }
    
    // Aguardar a inicialização completa da autenticação
    if (!authInitialized) {
      console.log("Index: Autenticação ainda não inicializada");
      return;
    }
    
    // Se ainda estiver carregando, não faça nada
    if (isLoading) {
      console.log("Index: Autenticação carregando...");
      return;
    }
    
    // Após determinar o estado de autenticação, redirecione adequadamente
    if (user) {
      console.log("Index: Usuário autenticado, redirecionando para /dashboard");
      setHasRedirected(true);
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);
    } else {
      console.log("Index: Usuário não autenticado, redirecionando para /login");
      setHasRedirected(true);
      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 100);
    }
  }, [user, isLoading, navigate, hasRedirected, authInitialized]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  );
};

export default Index;
