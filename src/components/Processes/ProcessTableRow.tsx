
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import ProcessStatusBadge from "./ProcessStatusBadge";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
}

const ProcessTableRow = ({
  process,
  departments,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  updateProcessStatus,
}: ProcessTableRowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);

  // Ordenar departamentos por ordem e filtrar o departamento "Concluído"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);

  // Função para obter a data de entrada de um departamento do histórico
  const getDepartmentEntryDate = (departmentId: string): string | null => {
    const historyEntry = process.history.find(h => h.departmentId === departmentId);
    return historyEntry ? historyEntry.entryDate : null;
  };

  // Verifica se o processo já passou pelo departamento
  const hasPassedDepartment = (departmentId: string): boolean => {
    return process.history.some(h => h.departmentId === departmentId);
  };

  // Verifica se o processo está atualmente no departamento
  const isCurrentDepartment = (departmentId: string): boolean => {
    return process.currentDepartment === departmentId;
  };

  // Verifica se é o primeiro departamento
  const isFirstDepartment = process.currentDepartment === sortedDepartments[0]?.id;
  
  // Verifica se é o último departamento
  const isLastDepartment = process.currentDepartment === sortedDepartments[sortedDepartments.length - 1]?.id;

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
      <TableCell>
        <ProcessTypePicker
          processId={process.id}
          currentTypeId={process.processType}
          processTypes={processTypes}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          isEditing={isEditing}
          setIsEditing={setIsEditing}
        />
      </TableCell>
      
      {/* Células para cada departamento */}
      {sortedDepartments.map((dept) => {
        const entryDate = getDepartmentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        
        return (
          <TableCell key={dept.id}>
            <ProcessDepartmentCell
              departmentId={dept.id}
              isCurrentDepartment={isActive}
              hasPassedDepartment={isPastDept}
              entryDate={entryDate}
            />
          </TableCell>
        );
      })}
      
      <TableCell><ProcessStatusBadge status={process.status} /></TableCell>
      <TableCell className="text-right">
        <ProcessActionButtons
          processId={process.id}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          setIsEditing={setIsEditing}
          isEditing={isEditing}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
