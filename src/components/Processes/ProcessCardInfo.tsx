
import { Process } from "@/types";
import { User } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { InfoItem } from "./InfoItem";
import { formatDateWithBrasiliaTimezone } from "@/utils/dateUtils";

type ProcessCardInfoProps = {
  process: Process;
  getDepartmentName: (id: string) => string;
  responsibleUserName?: string;
};

const ProcessCardInfo = ({
  process,
  getDepartmentName,
  responsibleUserName
}: ProcessCardInfoProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <InfoItem 
        label="Setor Atual"
        value={getDepartmentName(process.currentDepartment)}
      />
      <InfoItem 
        label="Data de Início"
        value={formatDateWithBrasiliaTimezone(process.startDate)}
      />
      <InfoItem 
        label="Tempo de Processamento"
        value={formatDistanceToNow(new Date(process.startDate), {
          locale: ptBR
        })}
      />
      <InfoItem 
        label="Previsão de Conclusão"
        value={formatDateWithBrasiliaTimezone(process.expectedEndDate)}
      />
      {responsibleUserName && (
        <div className="col-span-2">
          <h3 className="text-sm font-medium text-muted-foreground mb-1 flex items-center">
            <User className="h-4 w-4 mr-1" /> Responsável
          </h3>
          <p className="font-medium">
            {responsibleUserName}
          </p>
        </div>
      )}
    </div>
  );
};

export default ProcessCardInfo;
