
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

interface ProcessMainDetailsProps {
  process: any;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  isNotStarted: boolean;
  startProcess?: (processId: string) => Promise<void>;
}

const ProcessMainDetails = ({
  process,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  isNotStarted,
  startProcess
}: ProcessMainDetailsProps) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = async () => {
    if (!process.currentDepartment) return;
    
    setIsLoadingResponsible(true);
    try {
      const responsible = await getSectorResponsible(process.id, process.currentDepartment);
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
    } finally {
      setIsLoadingResponsible(false);
    }
  };

  // Carrega o responsável quando o componente é montado ou quando o departamento atual muda
  useEffect(() => {
    loadSectorResponsible();
  }, [process.id, process.currentDepartment]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async () => {
    if (!user || !process.protocolNumber) return;
    
    const success = await acceptProcessResponsibility(process.id, process.protocolNumber);
    if (success) {
      await loadSectorResponsible();
      toast({
        title: "Sucesso",
        description: "Você aceitou a responsabilidade pelo processo."
      });
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detalhes do Processo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Setor Atual
            </h3>
            <p className="font-medium">
              {getDepartmentName(process.currentDepartment)}
            </p>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Data de Início
            </h3>
            <div className="flex items-center">
              <Calendar className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {format(new Date(process.startDate), "dd 'de' MMMM 'de' yyyy", {
                  locale: ptBR
                })}
              </span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Tipo de Processo
            </h3>
            <div className="flex items-center">
              <FileText className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>{getProcessTypeName(process.processType)}</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Tempo no Setor Atual
            </h3>
            <div className="flex items-center">
              <Clock className="mr-2 h-4 w-4 text-muted-foreground" />
              <span>
                {process.daysInCurrentDepartment} dias
                {process.status === "overdue" && (
                  <span className="text-red-500 ml-2">
                    (Atrasado)
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-medium">Ações</h3>
          
          <ProcessActionButtons 
            processId={process.id}
            protocolNumber={process.protocolNumber}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            isFirstDepartment={isFirstDepartment}
            isLastDepartment={isLastDepartment}
            setIsEditing={() => {}}
            isEditing={false}
            status={process.status}
            startProcess={startProcess}
            hasSectorResponsible={!!sectorResponsible}
            onAcceptResponsibility={handleAcceptResponsibility}
            isAccepting={isAccepting}
            sectorId={process.currentDepartment}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessMainDetails;
