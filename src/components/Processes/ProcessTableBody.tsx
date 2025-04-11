import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { Department, Process, ProcessType, PROCESS_STATUS } from "@/types";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessActionButtons from "./ProcessActionButtons";
import ProcessTableEmpty from "./ProcessTableEmpty";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "@/hooks/auth";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  sortedDepartments: Department[];
  concludedDept: Department | undefined;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  hasProcessResponsible: (processId: string) => boolean;
  setProcessResponsibles?: (newState: Record<string, string | null>) => void;
  processResponsibles: Record<string, string | null>;
}

const ProcessTableBody = ({
  processes,
  departments,
  sortedDepartments,
  concludedDept,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  startProcess,
  hasProcessResponsible,
  processResponsibles,
  setProcessResponsibles
}: ProcessTableBodyProps) => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const getMostRecentEntryDate = (process: Process, departmentId: string): string | null => {
    const departmentEntries = process.history
      .filter(h => h.departmentId === departmentId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
  };

  const getRowBackgroundColor = (status: string) => {
    if (status === PROCESS_STATUS.COMPLETED) return "bg-green-200";
    if (status === PROCESS_STATUS.OVERDUE) return "bg-red-200";
    if (status === PROCESS_STATUS.PENDING) return "bg-blue-200";
    return "";
  };

  const handleRowClick = (processId: string) => {
    navigate(`/processes/${processId}`);
  };

  const handleAcceptProcess = (processId: string) => {
    if (!setProcessResponsibles) return;
    
    const newResponsibles = {...processResponsibles};
    newResponsibles[processId] = "accepted"; // qualquer valor não-nulo funciona aqui
    setProcessResponsibles(newResponsibles);
  };
  
  if (processes.length === 0) {
    return <ProcessTableEmpty columnsCount={sortedDepartments.length + 3} />;
  }

  return (
    <TableBody>
      {processes.map(process => {
        const isMainResponsible = process.responsibleUser === user?.id;
        const isSectorResponsible = hasProcessResponsible(process.id);
        
        return (
          <TableRow 
            key={process.id} 
            className={cn(
              "cursor-pointer hover:bg-gray-100",
              getRowBackgroundColor(process.status)
            )}
            onClick={() => handleRowClick(process.id)}
          >
            <TableCell className="font-medium">
              {process.protocolNumber}
            </TableCell>
            <TableCell onClick={e => e.stopPropagation()}>
              <ProcessTypePicker 
                processId={process.id} 
                currentTypeId={process.processType} 
                processTypes={processTypes} 
                getProcessTypeName={getProcessTypeName} 
                updateProcessType={updateProcessType} 
              />
            </TableCell>
            
            {sortedDepartments.map(dept => {
              const entryDate = getMostRecentEntryDate(process, dept.id);
              const isPastDept = process.history.some(h => h.departmentId === dept.id) && 
                (departments.find(d => d.id === dept.id)?.order || 0) < 
                (departments.find(d => d.id === process.currentDepartment)?.order || 0);
              const isActive = process.currentDepartment === dept.id;

              let isOverdue = false;
              if (isActive && process.status !== PROCESS_STATUS.NOT_STARTED) {
                if (dept.timeLimit > 0 && entryDate) {
                  const entryDateTime = new Date(entryDate).getTime();
                  const deadlineTime = entryDateTime + dept.timeLimit * 24 * 60 * 60 * 1000;
                  const currentTime = new Date().getTime();
                  isOverdue = currentTime > deadlineTime;
                }
              }
              
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
                    isProcessStarted={process.status !== PROCESS_STATUS.NOT_STARTED}
                  />
                </TableCell>
              );
            })}
            
            <TableCell onClick={e => e.stopPropagation()} className="text-center px-0">
              <ProcessActionButtons 
                processId={process.id} 
                moveProcessToPreviousDepartment={moveProcessToPreviousDepartment} 
                moveProcessToNextDepartment={moveProcessToNextDepartment} 
                isFirstDepartment={process.currentDepartment === sortedDepartments[0]?.id}
                isLastDepartment={process.currentDepartment === concludedDept?.id}
                setIsEditing={() => {}} 
                isEditing={false} 
                status={process.status}
                startProcess={startProcess}
                protocolNumber={process.protocolNumber}
                hasResponsibleUser={hasProcessResponsible(process.id)}
                onAccept={() => handleAcceptProcess(process.id)}
                currentDepartmentId={process.currentDepartment}
                isMainResponsible={isMainResponsible}
                isSectorResponsible={isSectorResponsible}
              />
            </TableCell>
          </TableRow>
        );
      })}
    </TableBody>
  );
};

export default ProcessTableBody;
