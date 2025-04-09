
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ArrowRight, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcesses } from "@/hooks/useProcesses";
import { formatDistanceToNow } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const RecentProcessList = () => {
  const navigate = useNavigate();
  const {
    processes,
    getDepartmentName,
    getProcessTypeName,
    filterProcesses
  } = useProcesses();
  const [limit, setLimit] = useState(5);

  // Aplicar filtros por departamento e status conforme a permissão do usuário
  const filteredProcesses = filterProcesses({});
  
  // Get the most recent processes
  const recentProcesses = [...filteredProcesses]
    .sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())
    .slice(0, limit);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case "overdue":
        return <Badge variant="outline" className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
      case "pending":
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em andamento</Badge>;
      case "not_started":
        return <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">Não iniciado</Badge>;
      default:
        return <Badge variant="outline">Desconhecido</Badge>;
    }
  };

  // Função para obter a cor de fundo baseada no status
  const getItemBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-200";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    return "";
  };

  return (
    <Card className="col-span-2">
      <CardHeader>
        <CardTitle>Processos Recentes</CardTitle>
        <CardDescription>
          Os processos mais recentemente cadastrados no sistema
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {recentProcesses.length === 0 ? (
          <p className="text-muted-foreground text-center py-6">
            Nenhum processo cadastrado
          </p>
        ) : (
          recentProcesses.map(process => (
            <div 
              key={process.id} 
              className={cn(
                "flex items-center justify-between border-b border-border pb-4 last:border-0 last:pb-0 rounded-md p-2", 
                getItemBackgroundColor(process.status)
              )}
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-medium">{process.protocolNumber}</h4>
                  {getStatusBadge(process.status)}
                </div>
                <p className="text-sm text-muted-foreground">
                  {getProcessTypeName(process.processType)} • {getDepartmentName(process.currentDepartment)}
                </p>
                <p className="text-xs text-muted-foreground">
                  Iniciado {formatDistanceToNow(new Date(process.startDate), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => navigate(`/processes/${process.id}`)}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            </div>
          ))
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="outline" 
          onClick={() => navigate("/processes")} 
          className="w-full bg-green-600 hover:bg-green-500 text-white"
        >
          Ver todos os processos
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default RecentProcessList;
