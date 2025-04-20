
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Calendar, Clock, FileText } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessDetailsResponsibility } from "@/hooks/useProcessDetailsResponsibility";

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
  // Usando o hook para obter informações de responsabilidade
  const { 
    sectorResponsible, 
    handleAcceptResponsibility, 
    isAccepting 
  } = useProcessDetailsResponsibility(process.id, process.currentDepartment);

  // Considera "Atendimento" como o primeiro setor (para garantir o disable no botão)
  // Pode ser necessário ajustar aqui caso o nome/id do setor inicial mude
  // Se for necessário refinar ainda mais, consulte a estrutura dos dados no backend
  const atendimentoIds = ["1", 1, "atendimento", "Atendimento"]; // cubra possíveis variantes
  const isAtendimento = atendimentoIds.includes(process.currentDepartment);

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
            processType={process.processType} {/* repassa para validar corretamente */}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            isFirstDepartment={isAtendimento || isFirstDepartment} {/* aplica a lógica para desabilitar botão se for atendimento */}
            setIsEditing={() => {}}
            isEditing={false}
            status={process.status}
            startProcess={startProcess}
            hasSectorResponsible={!!sectorResponsible}
            onAcceptResponsibility={() => handleAcceptResponsibility(process.protocolNumber)}
            isAccepting={isAccepting}
            sectorId={process.currentDepartment}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ProcessMainDetails;
