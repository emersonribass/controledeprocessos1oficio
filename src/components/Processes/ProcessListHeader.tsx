
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PlusCircle, ArrowUpRight, Clock } from "lucide-react";
import { useAuth } from "@/hooks/auth";

interface ProcessListHeaderProps {
  title: string;
  description: string;
}

const ProcessListHeader = ({ title, description }: ProcessListHeaderProps) => {
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const handleViewNonStarted = () => {
    navigate("/processes?status=not_started");
  };

  const handleViewInProgress = () => {
    // Limpa filtros específicos e mantém apenas excludeCompleted
    navigate("/processes");
  };

  return (
    <div className="flex justify-between items-center">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">
          {description}
        </p>
      </div>
      <div className="flex gap-2">
        {/* Botão para visualizar processos em andamento */}
        <Button 
          onClick={handleViewInProgress} 
          variant="outline" 
          className="flex items-center gap-1 px-[10px] text-sm text-center bg-blue-600 hover:bg-blue-500 text-white"
        >
          <Clock className="h-5 w-5" />
          Processos em andamento
        </Button>
        
        {/* Botão para visualizar processos não iniciados */}
        <Button 
          onClick={handleViewNonStarted} 
          variant="outline" 
          className="flex items-center gap-1 px-[10px] text-sm text-center bg-green-600 hover:bg-green-500 text-white"
        >
          <ArrowUpRight className="h-5 w-5" />
          Processos não iniciados
        </Button>
        
        {/* Botão para criar novo processo - apenas para admin ou usuários sem departamento atribuído */}
        {(isAdmin(user?.email || "") || user?.departments?.length === 0) && (
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
  );
};

export default ProcessListHeader;
