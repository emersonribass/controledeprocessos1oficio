import { Process } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { formatDistanceToNow } from "date-fns";
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, User } from "lucide-react";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
type ProcessCardProps = {
  process: Process;
  getProcessTypeName: (id: string) => string;
  getDepartmentName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  responsibleUserName?: string;
};
const ProcessCard = ({
  process,
  getProcessTypeName,
  getDepartmentName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  responsibleUserName
}: ProcessCardProps) => {
  return <Card className="md:col-span-2">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Protocolo: {process.protocolNumber}</span>
          <ProcessStatusBadge status={process.status} />
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
              {format(new Date(process.startDate), "dd/MM/yyyy", {
              locale: ptBR
            })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Tempo de Processamento
            </h3>
            <p className="font-medium">
              {formatDistanceToNow(new Date(process.startDate), {
              locale: ptBR
            })}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-muted-foreground mb-1">
              Previsão de Conclusão
            </h3>
            <p className="font-medium">
              {format(new Date(process.expectedEndDate), "dd/MM/yyyy", {
              locale: ptBR
            })}
            </p>
          </div>
          {responsibleUserName && <div className="col-span-2">
              <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
                <User className="h-4 w-4 mr-1" /> Responsável
              </h3>
              <p className="font-medium">
                {responsibleUserName}
              </p>
            </div>}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => moveProcessToPreviousDepartment(process.id)} disabled={process.currentDepartment === "1"} className="text-white gap-0 bg-green-600 hover:bg-green-500">
          <MoveLeft className="mr-2 h-4 w-4" />
          Departamento Anterior
        </Button>
        <Button onClick={() => moveProcessToNextDepartment(process.id)} disabled={process.currentDepartment === "10"} className="gap-0">
          Próximo Departamento
          <MoveRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>;
};
export default ProcessCard;