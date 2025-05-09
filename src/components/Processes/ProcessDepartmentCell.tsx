
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User } from "lucide-react";
import { addBusinessDays, getRemainingBusinessDays } from "@/utils/dateUtils";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessDepartmentCell");

interface ProcessDepartmentCellProps {
  departmentId: string;
  isCurrentDepartment: boolean;
  hasPassedDepartment: boolean;
  entryDate: string | null;
  showDate: boolean;
  isDepartmentOverdue?: boolean;
  departmentTimeLimit?: number;
  isProcessStarted?: boolean;
  responsible?: {
    nome: string;
    email: string;
  } | null;
  isFirstDepartment?: boolean;
}

const ProcessDepartmentCell = ({
  departmentId,
  isCurrentDepartment,
  hasPassedDepartment,
  entryDate,
  showDate,
  isDepartmentOverdue = false,
  departmentTimeLimit = 0,
  isProcessStarted = true,
  responsible,
  isFirstDepartment = false
}: ProcessDepartmentCellProps) => {
  // Log para depurar a exibição de responsáveis
  logger.debug(`Departamento ${departmentId}: responsible=${responsible ? JSON.stringify(responsible) : 'null'}, isProcessStarted=${isProcessStarted}, isCurrentDepartment=${isCurrentDepartment}, hasPassedDepartment=${hasPassedDepartment}`);
  
  // Calcular dias úteis restantes se for o departamento atual
  let remainingDays = 0;
  if (isProcessStarted && isCurrentDepartment && entryDate && departmentTimeLimit > 0) {
    const entryDateTime = new Date(entryDate);
    const deadlineTime = addBusinessDays(entryDateTime, departmentTimeLimit);
    remainingDays = getRemainingBusinessDays(deadlineTime);
  }

  // Apenas exibe responsáveis para departamentos atuais ou que já passaram
  const shouldShowResponsible = isProcessStarted && responsible && (isCurrentDepartment || hasPassedDepartment);
  
  // Log específico para quando deveria mostrar responsável
  if (isCurrentDepartment || hasPassedDepartment) {
    logger.debug(`Departamento ${departmentId} (atual ou passado): shouldShowResponsible=${shouldShowResponsible}, responsible=${responsible ? JSON.stringify(responsible.nome) : 'null'}`);
  }

  return (
    <div className="text-center w-full">
      {showDate && entryDate && (
        <div className="text-xs text-black">
          {format(new Date(entryDate), "dd/MM/yyyy", {
            locale: ptBR
          })}
        </div>
      )}

      {/* Exibição do responsável apenas se existir, se o processo estiver iniciado e se for departamento atual ou anterior */}
      {shouldShowResponsible && (
        <div className="text-xs text-gray-600 mt-1">
          <div className="flex items-center justify-center gap-1">
            <User className="h-3 w-3" />
            <span className="font-medium">
              {isFirstDepartment ? "Resp.:" : "Resp.:"}
            </span>
          </div>
          <span className="text-primary text-[11px]">
            {responsible.nome || "Aguardando"}
          </span>
        </div>
      )}

      {isCurrentDepartment && isProcessStarted && departmentTimeLimit > 0 && (
        <div className={cn(
          "text-xs font-medium mt-1",
          isDepartmentOverdue ? "text-red-600" : "text-blue-600"
        )}>
          {isDepartmentOverdue ? (
            <span className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Prazo expirado
            </span>
          ) : (
            remainingDays > 0 ? `${remainingDays} dia(s) útil(is) restante(s)` : "Vence hoje"
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
