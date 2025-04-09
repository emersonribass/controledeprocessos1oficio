
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock } from "lucide-react";

interface ProcessDepartmentCellProps {
  departmentId: string;
  isCurrentDepartment: boolean;
  hasPassedDepartment: boolean;
  entryDate: string | null;
  showDate: boolean;
  isDepartmentOverdue?: boolean;
  departmentTimeLimit?: number;
  isProcessStarted?: boolean;
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
}: ProcessDepartmentCellProps) => {
  // Calcular dias restantes se for o departamento atual
  let remainingDays = 0;
  if (isProcessStarted && isCurrentDepartment && entryDate && departmentTimeLimit > 0) {
    const entryDateTime = new Date(entryDate).getTime();
    const deadlineTime = entryDateTime + (departmentTimeLimit * 24 * 60 * 60 * 1000);
    const currentTime = new Date().getTime();
    
    remainingDays = Math.ceil((deadlineTime - currentTime) / (24 * 60 * 60 * 1000));
  }

  return (
    <div className="text-center">
      {showDate && entryDate && (
        <div className="text-xs text-gray-600">
          {format(new Date(entryDate), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )}
      {isCurrentDepartment && isProcessStarted && (
        <div className={cn(
          "text-xs font-medium", 
          isDepartmentOverdue ? "text-red-600" : "text-blue-600"
        )}>
          {isDepartmentOverdue ? (
            <span className="flex items-center justify-center gap-1">
              <Clock className="h-3 w-3" /> Prazo expirado
            </span>
          ) : (
            <span>Em andamento</span>
          )}
          {!isDepartmentOverdue && departmentTimeLimit > 0 && (
            <div className="text-xs mt-1">
              {remainingDays > 0 
                ? `${remainingDays} dia(s) restante(s)` 
                : "Vence hoje"}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
