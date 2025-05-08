
import { cn } from "@/lib/utils";
import { Clock, User, Archive } from "lucide-react";
import { addBusinessDays, getRemainingBusinessDays, formatDateWithBrasiliaTimezone } from "@/utils/dateUtils";

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
  isArchived?: boolean;
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
  isFirstDepartment = false,
  isArchived = false
}: ProcessDepartmentCellProps) => {
  // Calcular dias úteis restantes se for o departamento atual
  let remainingDays = 0;
  if (isProcessStarted && isCurrentDepartment && entryDate && departmentTimeLimit > 0 && !isArchived) {
    const entryDateTime = new Date(entryDate);
    const deadlineTime = addBusinessDays(entryDateTime, departmentTimeLimit);
    remainingDays = getRemainingBusinessDays(deadlineTime);
  }

  // Apenas exibe responsáveis para departamentos atuais ou que já passaram
  const shouldShowResponsible = isProcessStarted && responsible && (isCurrentDepartment || hasPassedDepartment);

  return (
    <div className="text-center w-full">
      {showDate && entryDate && (
        <div className="text-xs text-black">
          {formatDateWithBrasiliaTimezone(entryDate).split(' ')[0]} {/* Exibir apenas a data, sem o horário */}
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

      {isCurrentDepartment && isProcessStarted && (
        <div className={cn(
          "text-xs font-medium mt-1",
          isArchived ? "text-orange-500" : (isDepartmentOverdue ? "text-red-600" : "text-blue-600")
        )}>
          {isArchived ? (
            <span className="flex items-center justify-center gap-1">
              <Archive className="h-3 w-3" /> Arquivado
            </span>
          ) : (
            isDepartmentOverdue ? (
              <span className="flex items-center justify-center gap-1">
                <Clock className="h-3 w-3" /> Prazo expirado
              </span>
            ) : (
              departmentTimeLimit > 0 ? (
                remainingDays > 0 ? `${remainingDays} dia(s) útil(is) restante(s)` : "Vence hoje"
              ) : null
            )
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
