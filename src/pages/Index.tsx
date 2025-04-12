
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);
  
  // Usar um efeito com timeout para evitar redirecionamentos em loop
  useEffect(() => {
    // Se ainda estiver carregando e não tentamos redirecionar, aguarde
    if (isLoading && !hasAttemptedRedirect) {
      console.log("Index: Aguardando carregamento da autenticação...");
      return;
    }
    
    // Evitar múltiplos redirecionamentos
    if (hasAttemptedRedirect) return;
    
    // Configurar um timeout para garantir que não ficará preso
    const redirectTimeout = setTimeout(() => {
      try {
        console.log("Index: Tentando redirecionar. User:", !!user, "isLoading:", isLoading);
        setHasAttemptedRedirect(true);
        
        if (user) {
          console.log("Index: Usuário autenticado, redirecionando para /dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          console.log("Index: Usuário não autenticado, redirecionando para /login");
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error("Erro ao tentar redirecionar:", error);
      }
    }, 1500); // Dar um tempo para o estado de autenticação ser definido
    
    return () => clearTimeout(redirectTimeout);
  }, [user, isLoading, navigate, hasAttemptedRedirect]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
      <p className="text-muted-foreground">Carregando...</p>
    </div>
  );
};

export default Index;
