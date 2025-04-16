
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, User } from "lucide-react";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

interface ProcessDepartmentCellProps {
  departmentId: string;
  isCurrentDepartment: boolean;
  hasPassedDepartment: boolean;
  entryDate: string | null;
  showDate: boolean;
  isDepartmentOverdue?: boolean;
  departmentTimeLimit?: number;
  isProcessStarted?: boolean;
  processResponsible?: ProcessResponsible | null;
  sectorResponsible?: ProcessResponsible | null;
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
  processResponsible = null,
  sectorResponsible = null
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
      
      {isCurrentDepartment && isProcessStarted && (
        <div className="space-y-2 mt-1">
          {/* Informação de prazo do departamento */}
          {departmentTimeLimit > 0 && (
            <div className={cn("text-xs flex items-center justify-center gap-1", 
              isDepartmentOverdue ? "text-red-600" : "text-blue-600"
            )}>
              {isDepartmentOverdue ? (
                <>
                  <Clock className="h-3 w-3" /> Prazo expirado
                </>
              ) : (
                <>
                  {remainingDays > 0 ? `${remainingDays} dia(s) restante(s)` : "Vence hoje"}
                </>
              )}
            </div>
          )}
          
          {/* Responsável pelo Processo */}
          <div className="text-xs mt-1">
            <span className="font-medium">Processo:</span> 
            <span className="text-gray-700 ml-1">
              {processResponsible ? processResponsible.nome : "Sem responsável"}
            </span>
          </div>
          
          {/* Responsável no Setor */}
          <div className="text-xs mt-1">
            <span className="font-medium">Setor:</span>
            <span className="text-gray-700 ml-1">
              {sectorResponsible ? sectorResponsible.nome : "Sem responsável"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
