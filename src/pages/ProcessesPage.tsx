
import { useEffect, useState } from "react";
import ProcessList from "@/components/Processes/ProcessList";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/auth";

const ProcessesPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    user,
    isAdmin
  } = useAuth();
  const [initialFilters, setInitialFilters] = useState({});

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

  const handleViewNonStarted = () => {
    navigate("/processes?status=not_started");
  };

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
            className="flex items-center gap-1 px-[10px] text-sm text-center"
          >
            <ArrowUpRight className="h-5 w-5" />
            Processos não iniciados
          </Button>
          
          {/* Botão para criar novo processo - apenas para admin ou usuários sem departamento atribuído */}
          {(isAdmin(user?.email || "") || user?.departments?.length === 0) && (
            <Button 
              onClick={() => navigate("/admin/process-settings")} 
              className="flex items-center gap-1 px-[10px] text-sm text-center text-white bg-blue-700 hover:bg-blue-600 font-medium rounded"
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

export default ProcessesPage;
