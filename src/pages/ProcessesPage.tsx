
import { useEffect, useState } from "react";
import ProcessList from "@/components/Processes/ProcessList";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/features/auth";
import { ProcessesProvider } from "@/features/processes";

const ProcessesPageContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const [initialFilters, setInitialFilters] = useState({});
  const [userIsAdmin, setUserIsAdmin] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const statusParam = searchParams.get('status');
    if (statusParam) {
      setInitialFilters({
        status: statusParam
      });
    } else {
      // Quando não há status na URL, resetamos os filtros
      setInitialFilters({});
    }
  }, [location.search]);

  useEffect(() => {
    // Usar o status admin já armazenado no objeto user
    if (user) {
      setUserIsAdmin(user.isAdmin || false);
    }
  }, [user]);

  const handleViewNonStarted = () => {
    navigate("/processes?status=not_started");
  };

  const shouldShowNewProcessButton = userIsAdmin || (user?.departments?.length === 0);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Processos</h2>
          <p className="text-muted-foreground">
            Gerencie e acompanhe o andamento de todos os processos.
          </p>
        </div>
        <div className="flex gap-2">
          {/* Botão para visualizar processos não iniciados - disponível para todos os usuários */}
          <Button 
            onClick={handleViewNonStarted} 
            variant="outline" 
            className="flex items-center gap-1 px-[10px] text-sm text-center bg-green-600 hover:bg-green-500 text-white"
          >
            <ArrowUpRight className="h-5 w-5" />
            Processos não iniciados
          </Button>
          
          {/* Botão para criar novo processo - apenas para admin ou usuários sem departamento atribuído */}
          {shouldShowNewProcessButton && (
            <Button 
              onClick={() => navigate("/admin/process-settings")} 
              className="flex items-center gap-1 px-[10px] text-sm text-center bg-blue-600 hover:bg-blue-500 rounded text-white font-medium"
            >
              <PlusCircle className="h-5 w-5" />
              Novo Processo
            </Button>
          )}
        </div>
      </div>

      <ProcessList initialFilters={initialFilters} />
    </div>
  );
};

const ProcessesPage = () => {
  // Aqui não é mais necessário o ProcessesProvider porque ele já está sendo aplicado
  // na rota em Routes.tsx para todas as rotas protegidas com needsProcesses=true
  return <ProcessesPageContent />;
};

export default ProcessesPage;
