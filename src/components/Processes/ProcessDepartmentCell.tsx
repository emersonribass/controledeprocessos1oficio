
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ProcessDepartmentCellProps {
  departmentId: string;
  isCurrentDepartment: boolean;
  hasPassedDepartment: boolean;
  entryDate: string | null;
  showDate: boolean;
}

const ProcessDepartmentCell = ({
  departmentId,
  isCurrentDepartment,
  hasPassedDepartment,
  entryDate,
  showDate,
}: ProcessDepartmentCellProps) => {
  return (
    <div 
      className={cn(
        "text-center",
        hasPassedDepartment ? "bg-green-50" : "",
        isCurrentDepartment ? "bg-blue-50 font-medium" : ""
      )}
    >
      {showDate && entryDate && (
        <div className="text-xs text-gray-600">
          {format(new Date(entryDate), "dd/MM/yyyy", { locale: ptBR })}
        </div>
      )}
      {isCurrentDepartment && (
        <div className="text-xs font-medium text-blue-600">
          Em andamento
        </div>
      )}
    </div>
  );
};

export default ProcessDepartmentCell;
