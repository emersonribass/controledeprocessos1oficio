
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Skeleton } from "@/components/ui/skeleton";

const Index = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // Se ainda estiver carregando, não faça nada
    if (isLoading) return;
    
    // Após determinar o estado de autenticação, redirecione adequadamente
    if (user) {
      navigate("/dashboard");
    } else {
      navigate("/login");
    }
  }, [user, isLoading, navigate]);

  // Mostrar tela de carregamento enquanto verifica autenticação
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    );
  }

  return null;
};

export default Index;
