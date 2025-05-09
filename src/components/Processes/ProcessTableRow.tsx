
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessRowActions from "./ProcessRowActions";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import { useProcessRowResponsibility } from "@/hooks/useProcessRowResponsibility";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useProcesses } from "@/hooks/useProcesses";
import { useDeadlineRenewalCondition } from "@/hooks/useDeadlineRenewalCondition";
import { createLogger } from "@/utils/loggerUtils";
import { useCallback } from "react";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import { useAuth } from "@/hooks/auth";
import { useProcessPermissionCheckers } from "@/hooks/process/permission/useProcessPermissionCheckers";

const logger = createLogger("ProcessTableRow");

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  onAcceptResponsibility: () => Promise<void>;
  isAccepting: boolean;
  hasSectorResponsible?: boolean; 
  canInitiateProcesses?: boolean;
  processResponsibles?: Record<string, any>;
  historyId?: number;
}

const ProcessTableRow = ({
  process,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  onAcceptResponsibility,
  isAccepting,
  hasSectorResponsible = false,
  canInitiateProcesses = false,
  processResponsibles,
  historyId
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  const { refreshProcesses } = useProcesses();
  const { queueSectorForLoading } = useProcessTableState([]);
  const { user } = useAuth();
  const { isUserProcessOwner } = useProcessPermissionCheckers();

  const { sectorResponsible } = useProcessRowResponsibility(process.id, process.currentDepartment);
  
  // Verificação se o usuário é o proprietário do processo
  const isOwner = user ? isUserProcessOwner(process, user.id) : false;
  
  // Log para depuração
  if (process.id === '118706' && user) {
    logger.debug(`Processo 118706: isOwner=${isOwner}, userId=${user.id}, processUserId=${process.userId}, hasSectorResponsible=${hasSectorResponsible}`);
  }
  
  const hasResponsible = hasSectorResponsible || !!sectorResponsible;
  const { canRenewDeadline, historyId: renewalHistoryId } = useDeadlineRenewalCondition(process);

  const {
    sortedDepartments,
    concludedDept,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue: checkDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  const getRowBorderColor = (status: string) => {
    if (status === "completed") return "border-l-4 border-l-green-600";
    if (status === "overdue") return "border-l-4 border-l-red-600";
    if (status === "pending") return "border-l-4 border-l-blue-600";
    if (status === "not_started") return "border-l-4 border-l-green-400";
    return "";
  };

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.process-action')) {
      e.stopPropagation();
      return;
    }
    navigate(`/processes/${process.id}`);
  };

  const handleAcceptResponsibility = useCallback(async () => {
    await onAcceptResponsibility();
    queueSectorForLoading(process.id, process.currentDepartment);
    await refreshProcesses();
  }, [onAcceptResponsibility, process.id, process.currentDepartment, queueSectorForLoading, refreshProcesses]);

  const isProcessOverdue = process.status === "overdue";
  
  if (canRenewDeadline && renewalHistoryId) {
    logger.debug(`Processo ${process.id} pode renovar prazo, historyId=${renewalHistoryId}`);
  }

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-100",
        getRowBorderColor(process.status)
      )}
      onClick={handleRowClick}
    >
      <TableCell className="w-[70px] whitespace-nowrap text-center font-medium">
        {process.protocolNumber}
      </TableCell>
      
      <TableCell className="w-[180px] whitespace-nowrap text-center process-action" onClick={e => e.stopPropagation()}>
        <ProcessTypePicker 
          processId={process.id} 
          currentTypeId={process.processType} 
          processTypes={processTypes} 
          getProcessTypeName={getProcessTypeName} 
          updateProcessType={updateProcessType} 
        />
      </TableCell>
      
      {sortedDepartments.map((dept) => {
        // Buscar o responsável para este departamento dos processResponsibles
        const deptResponsible = processResponsibles && processResponsibles[process.id] && processResponsibles[process.id][dept.id];
        
        return (
          <TableCell key={dept.id} className="min-w-[120px] text-center">
            <ProcessDepartmentCell 
              departmentId={dept.id}
              isCurrentDepartment={isCurrentDepartment(dept.id)}
              hasPassedDepartment={hasPassedDepartment(dept.id)}
              entryDate={getMostRecentEntryDate(dept.id)}
              showDate={isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)}
              isDepartmentOverdue={isCurrentDepartment(dept.id) && checkDepartmentOverdue(dept.id, process.status !== "not_started")}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={process.status !== "not_started"}
              responsible={deptResponsible}
              isFirstDepartment={dept.id === sortedDepartments[0]?.id}
            />
          </TableCell>
        );
      })}
    
      <TableCell className="w-[120px] process-action">
        <ProcessRowActions 
          processId={process.id}
          protocolNumber={process.protocolNumber}
          processType={process.processType}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          status={process.status}
          startProcess={canInitiateProcesses || process.status === "not_started" ? startProcess : undefined}
          hasSectorResponsible={hasResponsible}
          onAcceptResponsibility={handleAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
          isOverdue={isProcessOverdue}
          currentDepartment={process.currentDepartment}
          historyId={renewalHistoryId}
          showRenewDeadlineButton={canRenewDeadline}
          onRenewalComplete={() => refreshProcesses()}
          isUserProcessOwner={isOwner}
          process={process}
        />
      </TableCell>
    </TableRow>
  );
})}

export default ProcessTableRow;
