
import { Button } from "@/components/ui/button";
import { TableCell, TableRow } from "@/components/ui/table";
import { Process } from "@/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Eye, MoveLeft, MoveRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProcessStatusBadge from "./ProcessStatusBadge";

interface ProcessTableRowProps {
  process: Process;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
}

const ProcessTableRow = ({
  process,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
}: ProcessTableRowProps) => {
  const navigate = useNavigate();

  return (
    <TableRow
      key={process.id}
      className={cn(
        process.status === "overdue" ? "bg-destructive/5" : ""
      )}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell>{getProcessTypeName(process.processType)}</TableCell>
      <TableCell>{getDepartmentName(process.currentDepartment)}</TableCell>
      <TableCell>
        {format(new Date(process.startDate), "dd/MM/yyyy", { locale: ptBR })}
      </TableCell>
      <TableCell><ProcessStatusBadge status={process.status} /></TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveProcessToPreviousDepartment(process.id)}
            disabled={process.currentDepartment === "1"}
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveProcessToNextDepartment(process.id)}
            disabled={process.currentDepartment === "10"}
          >
            <MoveRight className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(`/processes/${process.id}`)}
          >
            <Eye className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
