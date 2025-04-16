
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";
import { CalendarClock, AlertCircle, CheckCircle2, User } from "lucide-react";

interface ProcessDepartmentCellProps {
  departmentId: string;
  isCurrentDepartment: boolean;
  hasPassedDepartment: boolean;
  entryDate: string | null;
  showDate: boolean;
  isDepartmentOverdue: boolean;
  departmentTimeLimit?: number;
  isProcessStarted: boolean;
  processResponsible?: ProcessResponsible | null;
  sectorResponsible?: ProcessResponsible | null;
}

const ProcessDepartmentCell = ({
  isCurrentDepartment,
  hasPassedDepartment,
  entryDate,
  showDate,
  isDepartmentOverdue,
  departmentTimeLimit,
  isProcessStarted,
  processResponsible,
  sectorResponsible
}: ProcessDepartmentCellProps) => {
  const getFormattedDate = (date: string) => {
    try {
      return format(new Date(date), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return date;
    }
  };

  // Cores específicas para cada estado do processo
  const getBadgeClasses = () => {
    if (isCurrentDepartment) {
      if (isDepartmentOverdue) {
        return "bg-red-100 hover:bg-red-200 text-red-800 border-red-200";
      } else {
        return "bg-blue-100 hover:bg-blue-200 text-blue-800 border-blue-200";
      }
    } else if (hasPassedDepartment) {
      return "bg-green-100 hover:bg-green-200 text-green-800 border-green-200";
    } else {
      return "bg-gray-100 hover:bg-gray-200 text-gray-800";
    }
  };

  const getIcon = () => {
    if (isCurrentDepartment) {
      if (isDepartmentOverdue) {
        return <AlertCircle className="h-4 w-4 text-red-600 mr-1" />;
      } else {
        return <CalendarClock className="h-4 w-4 text-blue-600 mr-1" />;
      }
    } else if (hasPassedDepartment) {
      return <CheckCircle2 className="h-4 w-4 text-green-600 mr-1" />;
    }
    return null;
  };

  return (
    <div className="flex flex-col items-center">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Badge
              variant="outline"
              className={`h-8 px-2 font-normal flex items-center justify-center w-full ${getBadgeClasses()}`}
            >
              {getIcon()}
              <span className="truncate max-w-[100px]">
                {showDate && entryDate ? getFormattedDate(entryDate) : ""}
              </span>
            </Badge>
          </TooltipTrigger>
          <TooltipContent>
            {isCurrentDepartment ? (
              <>
                {isDepartmentOverdue
                  ? "Prazo ultrapassado"
                  : "Departamento atual do processo"}
                {isProcessStarted && departmentTimeLimit && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Prazo: {departmentTimeLimit} dia(s)
                  </div>
                )}
                {sectorResponsible && (
                  <div className="flex items-center text-xs text-muted-foreground mt-1">
                    <User className="h-3 w-3 mr-1" />
                    Responsável: {sectorResponsible.name}
                  </div>
                )}
              </>
            ) : hasPassedDepartment ? (
              "Departamento já processado"
            ) : (
              "Aguardando"
            )}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
};

export default ProcessDepartmentCell;
