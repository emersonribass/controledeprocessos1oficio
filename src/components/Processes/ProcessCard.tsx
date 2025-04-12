
import { Process } from "@/types";
import { formatDistanceToNow, format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, User } from "lucide-react";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProcessCardInfo from "./ProcessCardInfo";

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
  // Verificar se o processo está no setor "Concluído(a)" usando o ID 10
  const isLastDepartment = process.currentDepartment === "10";
  const isFirstDepartment = process.currentDepartment === "1";

  return (
    <Card className="md:col-span-2">
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
        <ProcessCardInfo 
          process={process} 
          getDepartmentName={getDepartmentName} 
          responsibleUserName={responsibleUserName} 
        />
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => moveProcessToPreviousDepartment(process.id)} 
          disabled={isFirstDepartment} 
          className={`text-white gap-0 bg-green-600 hover:bg-green-500 ${isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          <MoveLeft className="mr-2 h-4 w-4" />
          Departamento Anterior
        </Button>
        <Button 
          onClick={() => moveProcessToNextDepartment(process.id)} 
          disabled={isLastDepartment} 
          className={`gap-0 ${isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
        >
          Próximo Departamento
          <MoveRight className="ml-2 h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProcessCard;
