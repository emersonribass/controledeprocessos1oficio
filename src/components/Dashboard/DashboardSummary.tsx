
import { useProcesses } from "@/hooks/useProcesses";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, AlertTriangle, BarChart, Clock } from "lucide-react";

const DashboardSummary = () => {
  const { processes } = useProcesses();

  // Calculate summary statistics
  const totalProcesses = processes.length;
  const completedProcesses = processes.filter(p => p.status === "completed").length;
  const overdueProcesses = processes.filter(p => p.status === "overdue").length;
  const pendingProcesses = processes.filter(p => p.status === "pending").length;
  
  // Calculate completion rate
  const completionRate = totalProcesses > 0 
    ? Math.round((completedProcesses / totalProcesses) * 100) 
    : 0;

  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Processos</CardTitle>
          <BarChart className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Em todos os departamentos
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos Concluídos</CardTitle>
          <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{completedProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Taxa de conclusão: {completionRate}%
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos em Andamento</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{pendingProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Aguardando processamento
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Processos Atrasados</CardTitle>
          <AlertTriangle className="h-4 w-4 text-destructive" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-destructive">{overdueProcesses}</div>
          <p className="text-xs text-muted-foreground mt-1">
            Necessitam atenção imediata
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardSummary;
