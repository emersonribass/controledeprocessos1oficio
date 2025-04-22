
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ProcessDepartmentCell from "./ProcessDepartmentCell";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessRowActions from "./ProcessRowActions";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import { useProcesses } from "@/hooks/useProcesses";
import { useDeadlineRenewalCondition } from "@/hooks/useDeadlineRenewalCondition";
import { createLogger } from "@/utils/loggerUtils";
import { useCallback } from "react";

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
  processResponsibles = {},
  historyId
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  const { refreshProcesses, queueSectorForLoading } = useProcesses();
  
  const hasResponsible = hasSectorResponsible || !!(processResponsibles && processResponsibles[process.currentDepartment]);
  
  const { canRenewDeadline, historyId: renewalHistoryId } = useDeadlineRenewalCondition(process);

  const {
    sortedDepartments,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  const getRowBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-400";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    if (status === "not_started") return "bg-green-300";
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
    await refreshProcesses();
    // Forçar carregamento do responsável após aceitar a responsabilidade
    if (queueSectorForLoading) {
      queueSectorForLoading(process.id, process.currentDepartment);
    }
  }, [onAcceptResponsibility, process.id, process.currentDepartment, queueSectorForLoading, refreshProcesses]);

  const isProcessOverdue = process.status === "overdue";
  
  if (canRenewDeadline && renewalHistoryId) {
    logger.debug(`Processo ${process.id} pode renovar prazo, historyId=${renewalHistoryId}`);
  }

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-100",
        getRowBackgroundColor(process.status)
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
        // Determinar se deve mostrar o responsável para este departamento
        const currentDeptOrder = sortedDepartments.findIndex(d => isCurrentDepartment(d.id));
        const deptIndex = sortedDepartments.findIndex(d => d.id === dept.id);
        const showResponsible = isCurrentDepartment(dept.id) || deptIndex <= currentDeptOrder;
        
        return (
          <TableCell key={dept.id} className="min-w-[120px] text-center">
            <ProcessDepartmentCell 
              departmentId={dept.id}
              isCurrentDepartment={isCurrentDepartment(dept.id)}
              hasPassedDepartment={hasPassedDepartment(dept.id)}
              entryDate={getMostRecentEntryDate(dept.id)}
              showDate={isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)}
              isDepartmentOverdue={isCurrentDepartment(dept.id) && isDepartmentOverdue(dept.id, process.status !== "not_started")}
              departmentTimeLimit={dept.timeLimit}
              isProcessStarted={process.status !== "not_started"}
              responsible={showResponsible ? processResponsibles[dept.id] : null}
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
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
