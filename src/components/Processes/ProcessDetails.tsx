
import { useNavigate, useParams } from "react-router-dom";
import { useProcesses } from "@/hooks/useProcesses";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, MoveLeft, MoveRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

const ProcessDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const {
    processes,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
  } = useProcesses();

  const process = processes.find((p) => p.id === id);

  if (!process) {
    return (
      <div className="flex flex-col items-center justify-center h-48">
        <h2 className="text-xl font-bold mb-2">Processo não encontrado</h2>
        <p className="text-muted-foreground mb-4">
          O processo que você está procurando não existe.
        </p>
        <Button onClick={() => navigate("/processes")}>
          Voltar para a lista
        </Button>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Concluído</Badge>;
      case "overdue":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Atrasado</Badge>;
      case "pending":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Em andamento</Badge>;
      default:
        return <Badge>Desconhecido</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => navigate("/processes")}
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-2xl font-bold">Detalhes do Processo</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Protocolo: {process.protocolNumber}</span>
              {getStatusBadge(process.status)}
            </CardTitle>
            <CardDescription>
              Tipo: {getProcessTypeName(process.processType)}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Departamento Atual
                </h3>
                <p className="font-medium">
                  {getDepartmentName(process.currentDepartment)}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Data de Início
                </h3>
                <p className="font-medium">
                  {format(new Date(process.startDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Tempo de Processamento
                </h3>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(process.startDate), { locale: ptBR })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium text-muted-foreground mb-1">
                  Previsão de Conclusão
                </h3>
                <p className="font-medium">
                  {format(new Date(process.expectedEndDate), "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              onClick={() => moveProcessToPreviousDepartment(process.id)}
              disabled={process.currentDepartment === "1"}
            >
              <MoveLeft className="mr-2 h-4 w-4" />
              Departamento Anterior
            </Button>
            <Button
              onClick={() => moveProcessToNextDepartment(process.id)}
              disabled={process.currentDepartment === "10"}
            >
              Próximo Departamento
              <MoveRight className="ml-2 h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2 h-5 w-5" />
              Histórico do Processo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {process.history.map((entry, index) => (
                <div key={index} className="relative pl-6 pb-4">
                  <div className="absolute left-0 top-0 h-full w-px bg-border"></div>
                  <div className="absolute left-0 top-1 h-2 w-2 rounded-full bg-primary"></div>
                  <div className="space-y-1">
                    <p className="font-medium">
                      {getDepartmentName(entry.departmentId)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Entrada: {format(new Date(entry.entryDate), "dd/MM/yyyy", { locale: ptBR })}
                    </p>
                    {entry.exitDate && (
                      <p className="text-sm text-muted-foreground">
                        Saída: {format(new Date(entry.exitDate), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ProcessDetails;
