
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { CardContent } from "@/components/ui/card";
import { User } from "lucide-react";

type ProcessCardContentProps = {
  startDate: string;
  expectedEndDate: string;
  currentDepartmentName: string;
  responsibleUserName?: string;
};

const ProcessCardContent = ({
  startDate,
  expectedEndDate,
  currentDepartmentName,
  responsibleUserName,
}: ProcessCardContentProps) => {
  return (
    <CardContent className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Departamento Atual
          </h3>
          <p className="font-medium">{currentDepartmentName}</p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Data de Início
          </h3>
          <p className="font-medium">
            {format(new Date(startDate), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Tempo de Processamento
          </h3>
          <p className="font-medium">
            {formatDistanceToNow(new Date(startDate), {
              locale: ptBR,
            })}
          </p>
        </div>
        <div>
          <h3 className="text-sm font-medium text-muted-foreground mb-1">
            Previsão de Conclusão
          </h3>
          <p className="font-medium">
            {format(new Date(expectedEndDate), "dd/MM/yyyy", {
              locale: ptBR,
            })}
          </p>
        </div>
        {responsibleUserName && (
          <div className="col-span-2">
            <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
              <User className="h-4 w-4 mr-1" /> Responsável
            </h3>
            <p className="font-medium">{responsibleUserName}</p>
          </div>
        )}
      </div>
    </CardContent>
  );
};

export default ProcessCardContent;
