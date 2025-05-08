
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
import { useCallback, useEffect, useState } from "react";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import { useAuth } from "@/hooks/auth";
import { useProcessPermissionCheckers } from "@/hooks/process/permission/useProcessPermissionCheckers";
import { ProcessResponsibilityService } from "@/services/ProcessResponsibilityService";

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
  processResponsibles: initialProcessResponsibles,
  historyId
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  const { refreshProcesses } = useProcesses();
  const { queueSectorForLoading } = useProcessTableState([]);
  const { user } = useAuth();
  const { isUserProcessOwner } = useProcessPermissionCheckers();
  const [sectorResponsibles, setSectorResponsibles] = useState<Record<string, any>>(initialProcessResponsibles || {});
  
  // Verificação se o usuário é o proprietário do processo
  const isOwner = user ? isUserProcessOwner(process, user.id) : false;
  
  // Log para depuração de processos específicos
  if (process.id === '118866') {
    logger.debug(`Processo 118866 detectado. Responsáveis iniciais:`, initialProcessResponsibles);
    logger.debug(`CurrentDepartment=${process.currentDepartment}, isOwner=${isOwner}, userId=${user?.id}, processUserId=${process.userId}`);
  }
  
  const { sectorResponsible } = useProcessRowResponsibility(process.id, process.currentDepartment);
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

  // Carrega responsáveis de todos os setores para o processo
  useEffect(() => {
    const loadSectorResponsibles = async () => {
      if (process.status === "not_started") return;
      
      // Obtém IDs de todos os setores
      const sectorIds = sortedDepartments.map(dept => dept.id);
      
      // Pré-carrega responsáveis para todos os setores do processo
      if (process.id === '118866') {
        logger.debug(`Carregando responsáveis para setores de processo 118866: ${sectorIds.join(', ')}`);
      }
      
      const responsibles = await ProcessResponsibilityService.preloadProcessResponsibles(
        process.id, 
        sectorIds
      );
      
      if (process.id === '118866') {
        logger.debug(`Responsáveis carregados para processo 118866:`, responsibles);
      }
      
      setSectorResponsibles(responsibles);
    };
    
    loadSectorResponsibles();
  }, [process.id, process.status, sortedDepartments]);

  const getRowBorderColor = (status: string) => {
    if (status === "archived") return "border-l-4 border-l-orange-500";
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
    
    // Recarregar responsáveis após aceitar responsabilidade
    const sectorIds = sortedDepartments.map(dept => dept.id);
    const responsibles = await ProcessResponsibilityService.preloadProcessResponsibles(
      process.id, 
      sectorIds
    );
    setSectorResponsibles(responsibles);
    
  }, [onAcceptResponsibility, process.id, process.currentDepartment, queueSectorForLoading, refreshProcesses, sortedDepartments]);

  const isProcessOverdue = process.status === "overdue";
  const isProcessArchived = process.status === "archived";

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
      
      {sortedDepartments.map((dept) => (
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
            responsible={sectorResponsibles[dept.id]}
            isFirstDepartment={dept.id === sortedDepartments[0]?.id}
            isArchived={isProcessArchived}
          />
        </TableCell>
      ))}
    
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
          process={process} // Passando o objeto process completo
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
