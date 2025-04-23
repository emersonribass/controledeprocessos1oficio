
import { useProcesses } from "@/hooks/useProcesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, AlertTriangle, BarChart, Clock } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/auth";
import { Process } from "@/types";
import { useEffect, useState } from "react";

const DashboardSummary = () => {
  const { processes, filterProcesses } = useProcesses();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [userProcesses, setUserProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar processos filtrados de forma assíncrona
  useEffect(() => {
    const loadFilteredProcesses = async () => {
      setIsLoading(true);
      try {
        // Filtrar processos com o método assíncrono
        const filtered = await filterProcesses({});
        setUserProcesses(filtered);
      } catch (error) {
        console.error("Erro ao filtrar processos:", error);
        setUserProcesses([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadFilteredProcesses();
  }, [processes, filterProcesses]);
  
  // Calculate summary statistics
  const totalProcesses = userProcesses.length;
  
  // Processos em andamento: aqueles que estão no setor atual do usuário
  const pendingProcesses = userProcesses.filter(p => p.status === "pending").length;
  
  // Processos atrasados: aqueles com status "overdue" no setor atual
  const overdueProcesses = userProcesses.filter(p => p.status === "overdue").length;
  
  // Processos concluídos: considera apenas status igual a "completed" (AJUSTADO)
  const completedProcesses = userProcesses.filter(p => p.status === "completed").length;
  
  // Taxa de conclusão ajustada
  const completionRate = totalProcesses > 0 
    ? Math.round((completedProcesses / totalProcesses) * 100) 
    : 0;

  const handleCardClick = (status: string) => {
    navigate(`/processes?status=${status}`);
  };

  if (isLoading) {
    return (
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map(i => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="h-12 bg-gray-100"></CardHeader>
            <CardContent className="h-24 bg-gray-50"></CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md bg-gradient-to-br from-blue-400/30 to-blue-100/30 border-blue-400/70",
        )}
        onClick={() => navigate('/processes')}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
          <BarChart className="h-4 w-4 text-blue-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            No seu setor
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md bg-gradient-to-br from-green-400/30 to-green-100/30 border-green-400/70",
        )}
        onClick={() => handleCardClick("completed")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos Concluídos</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">{completedProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Enviados para próximo setor: {completionRate}%
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md bg-yellow-500/20 border-yellow-500/30",
        )}
        onClick={() => handleCardClick("pending")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-yellow-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-yellow-600">{pendingProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando processamento no seu setor
          </p>
        </CardContent>
      </Card>
      
      <Card 
        className={cn(
          "cursor-pointer transition-all hover:shadow-md bg-red-500/20 border-red-500/30",
        )}
        onClick={() => handleCardClick("overdue")}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos Atrasados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-red-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{overdueProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Com prazo expirado no seu setor
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
