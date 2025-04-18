
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
  
  // Processos concluídos: aqueles que foram processados pelo setor do usuário
  // (têm uma entrada no histórico com o setor do usuário e data de saída não nula)
  const completedProcesses = userProcesses.filter(process => {
    if (!user?.departments?.length) return false;
    
    // Verificar se existe alguma entrada no histórico com o setor do usuário e data de saída não nula
    return process.history.some(historyItem => {
      // Convertendo ambos para string para garantir comparação correta
      const userDepartmentsAsStrings = user.departments.map(dept => String(dept));
      return userDepartmentsAsStrings.includes(String(historyItem.departmentId)) && 
        historyItem.exitDate !== null;
    });
  }).length;
  
  // Calculate completion rate
  const completionRate = totalProcesses > 0 
    ? Math.round((completedProcesses / totalProcesses) * 100) 
    : 0;

  // Função para redirecionar para a lista de processos com filtro
  const handleCardClick = (status) => {
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
          "cursor-pointer transition-all hover:shadow-md bg-blue-500/20 border-blue-500/30",
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
          "cursor-pointer transition-all hover:shadow-md bg-green-500/20 border-green-500/30",
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
