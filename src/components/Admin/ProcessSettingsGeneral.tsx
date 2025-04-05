
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

const ProcessSettingsGeneral = () => {
  const { processes, isLoading, updateProcessStatus } = useProcesses();
  const [notStartedProcesses, setNotStartedProcesses] = useState<Process[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Filtrar apenas processos não iniciados
    const filteredProcesses = processes.filter(p => p.status === 'not_started');
    setNotStartedProcesses(filteredProcesses);
  }, [processes]);

  const handleStartProcess = async (processId: string) => {
    try {
      await updateProcessStatus(processId, "Em andamento");
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Processos Não Iniciados</CardTitle>
        <CardDescription>
          Lista de processos cadastrados que ainda não foram iniciados
        </CardDescription>
      </CardHeader>
      <CardContent>
        {notStartedProcesses.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-muted-foreground">
              Não há processos aguardando início
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {notStartedProcesses.map((process) => (
              <div key={process.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <h4 className="font-medium">{process.protocolNumber}</h4>
                  <p className="text-sm text-muted-foreground">
                    Cadastrado {formatDistanceToNow(new Date(process.startDate), { addSuffix: true, locale: ptBR })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => navigate(`/processes/${process.id}`)}
                  >
                    Detalhes
                  </Button>
                  <Button 
                    size="sm"
                    onClick={() => handleStartProcess(process.id)}
                  >
                    Iniciar
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProcessSettingsGeneral;
