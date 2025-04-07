
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

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
  startProcess?: (processId: string) => Promise<void>;
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
  startProcess,
}: ProcessTableRowProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const isNotStarted = process.status === "not_started";
  const isProcessStarted = !isNotStarted;

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

  // Determina se um departamento é anterior ao departamento atual
  const isPreviousDepartment = (departmentId: string): boolean => {
    const deptOrder = departments.find(d => d.id === departmentId)?.order || 0;
    const currentDeptOrder = departments.find(d => d.id === process.currentDepartment)?.order || 0;
    return deptOrder < currentDeptOrder;
  };

  // Verifica se o departamento está com prazo expirado usando a nova propriedade
  const isDepartmentOverdue = (departmentId: string): boolean => {
    if (departmentId !== process.currentDepartment || !isProcessStarted) return false;
    return !!process.isDepartmentOverdue;
  };

  // Verifica se é o primeiro departamento
  const isFirstDepartment = process.currentDepartment === sortedDepartments[0]?.id;
  
  // Verifica se é o último departamento
  const isLastDepartment = process.currentDepartment === sortedDepartments[sortedDepartments.length - 1]?.id;

  // Função para navegar para a página de detalhes do processo
  const handleRowClick = () => {
    console.log("Clicou na linha do processo:", process.id);
    navigate(`/processes/${process.id}`);
  };

  return (
    <TableRow
      key={process.id}
      className={cn(
        "cursor-pointer hover:bg-gray-100",
        process.status === "overdue" ? "bg-destructive/5" : "",
        isNotStarted ? "bg-blue-50" : "",
      )}
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell>
        <div onClick={(e) => e.stopPropagation()}>
          <ProcessTypePicker
            processId={process.id}
            currentTypeId={process.processType}
            processTypes={processTypes}
            getProcessTypeName={getProcessTypeName}
            updateProcessType={updateProcessType}
          />
        </div>
      </TableCell>
      
      {/* Células para cada departamento */}
      {sortedDepartments.map((dept) => {
        const entryDate = getDepartmentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id) && isPreviousDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id);
        
        return (
          <TableCell key={dept.id}>
            <div onClick={(e) => e.stopPropagation()}>
              <ProcessDepartmentCell
                departmentId={dept.id}
                isCurrentDepartment={isActive}
                hasPassedDepartment={isPastDept}
                entryDate={entryDate}
                showDate={isActive || isPastDept}
                isDepartmentOverdue={isActive && isOverdue}
                departmentTimeLimit={dept.timeLimit}
                isProcessStarted={isProcessStarted}
              />
            </div>
          </TableCell>
        );
      })}
      
      <TableCell className="text-right">
        <div onClick={(e) => e.stopPropagation()}>
          <ProcessActionButtons
            processId={process.id}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
            isFirstDepartment={isFirstDepartment}
            isLastDepartment={isLastDepartment}
            setIsEditing={() => {}}
            isEditing={false}
            status={process.status}
            startProcess={startProcess}
          />
        </div>
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
