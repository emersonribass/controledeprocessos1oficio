import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User } from "lucide-react";

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
  };
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
  // Calcular dias restantes se for o departamento atual
  let remainingDays = 0;
  if (isProcessStarted && isCurrentDepartment && entryDate && departmentTimeLimit > 0) {
    const entryDateTime = new Date(entryDate).getTime();
    const deadlineTime = entryDateTime + departmentTimeLimit * 24 * 60 * 60 * 1000;
    const currentTime = new Date().getTime();
    remainingDays = Math.ceil((deadlineTime - currentTime) / (24 * 60 * 60 * 1000));
  }

  return (
    <div className="text-center">
      {showDate && entryDate && (
        <div className="text-xs text-black">
          {format(new Date(entryDate), "dd/MM/yyyy", {
            locale: ptBR
          })}
        </div>
      )}

      {/* Exibição do responsável */}
      {isProcessStarted && (
        <div className="text-xs text-gray-600 mt-1">
          <div className="flex items-center justify-center gap-1">
            <User className="h-3 w-3" />
            <span className="font-medium">
              {isFirstDepartment ? "Resp. Inicial:" : "Resp. Atual:"}
            </span>
          </div>
          <span className="text-primary text-[11px]">
            {responsible?.nome || "Aguardando"}
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
            remainingDays > 0 ? `${remainingDays} dia(s) restante(s)` : "Vence hoje"
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
