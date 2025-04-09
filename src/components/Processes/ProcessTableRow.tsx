
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import ProcessStatusBadge from "./ProcessStatusBadge";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import { useAuth } from "@/hooks/auth";
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

  const isNotStarted = process.status === "not_started";
  const isCompleted = process.status === "completed";
  const isOverdue = process.status === "overdue";
  const isPending = process.status === "pending";
  const isProcessStarted = !isNotStarted;

  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);

  const lastVisibleDept = sortedDepartments[sortedDepartments.length - 1];
  
  const concludedDept = departments.find(dept => dept.name === "Concluído(a)");

  const getMostRecentEntryDate = (departmentId: string): string | null => {
    const departmentEntries = process.history
      .filter(h => h.departmentId === departmentId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    
    return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
  };

  const hasPassedDepartment = (departmentId: string): boolean => {
    return process.history.some(h => h.departmentId === departmentId);
  };

  const isCurrentDepartment = (departmentId: string): boolean => {
    return process.currentDepartment === departmentId;
  };

  const isPreviousDepartment = (departmentId: string): boolean => {
    const deptOrder = departments.find(d => d.id === departmentId)?.order || 0;
    const currentDeptOrder = departments.find(d => d.id === process.currentDepartment)?.order || 0;
    return deptOrder < currentDeptOrder;
  };

  const isDepartmentOverdue = (departmentId: string): boolean => {
    if (departmentId !== process.currentDepartment || !isProcessStarted) return false;
    
    const dept = departments.find(d => d.id === departmentId);
    if (!dept || dept.timeLimit <= 0) return false;
    
    const entryDate = getMostRecentEntryDate(departmentId);
    if (!entryDate) return false;
    
    const entryDateTime = new Date(entryDate).getTime();
    const deadlineTime = entryDateTime + (dept.timeLimit * 24 * 60 * 60 * 1000);
    const currentTime = new Date().getTime();
    
    return currentTime > deadlineTime;
  };

  const isFirstDepartment = process.currentDepartment === sortedDepartments[0]?.id;
  
  const isLastVisibleDepartment = lastVisibleDept && process.currentDepartment === lastVisibleDept.id && !concludedDept;

  // Define a cor de fundo com base no status do processo
  const getRowBackgroundColor = () => {
    if (isCompleted) return "bg-green-300";
    if (isOverdue) return "bg-red-300";
    if (isPending) return "bg-blue-300";
    return "";
  };

  return (
    <TableRow
      key={process.id}
      className={cn(getRowBackgroundColor())}
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
        />
      </TableCell>
      
      {sortedDepartments.map((dept) => {
        const entryDate = getMostRecentEntryDate(dept.id);
        const isPastDept = hasPassedDepartment(dept.id) && isPreviousDepartment(dept.id);
        const isActive = isCurrentDepartment(dept.id);
        const isOverdue = isDepartmentOverdue(dept.id);
        
        return (
          <TableCell key={dept.id}>
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
          isLastDepartment={isLastVisibleDepartment}
          setIsEditing={() => {}}
          isEditing={false}
          status={process.status}
          startProcess={startProcess}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
