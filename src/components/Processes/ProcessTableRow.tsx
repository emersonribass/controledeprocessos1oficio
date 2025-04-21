
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
  
  const { sectorResponsible } = useProcessRowResponsibility(process.id, process.currentDepartment);
  const { getProcessResponsible } = useProcessResponsibility();
  
  const hasResponsible = hasSectorResponsible || !!sectorResponsible;
  
  // Verificar se o processo pode ter o prazo renovado
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

  // Verificar se o processo está atrasado no departamento atual
  const isProcessOverdue = process.status === "overdue";
  
  // Se canRenewDeadline for true e renewalHistoryId for válido, mostrar o botão
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
      {/* Protocolo - Largura fixa de 70px */}
      <TableCell className="w-[70px] whitespace-nowrap text-center font-medium">
        {process.protocolNumber}
      </TableCell>
      
      {/* Tipo de Processo - Largura fixa de 180px */}
      <TableCell className="w-[180px] whitespace-nowrap text-center process-action" onClick={e => e.stopPropagation()}>
        <ProcessTypePicker 
          processId={process.id} 
          currentTypeId={process.processType} 
          processTypes={processTypes} 
          getProcessTypeName={getProcessTypeName} 
          updateProcessType={updateProcessType} 
        />
      </TableCell>
      
      {/* Departamentos - Largura mínima de 120px para cada */}
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
            responsible={processResponsibles?.[dept.id]}
            isFirstDepartment={dept.id === sortedDepartments[0]?.id}
          />
        </TableCell>
      ))}
    
      {/* Ações - Largura fixa de 150px */}
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
          onAcceptResponsibility={onAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
          isOverdue={isProcessOverdue}
          currentDepartment={process.currentDepartment}
          historyId={renewalHistoryId} // Utilizar o ID identificado pelo hook
          showRenewDeadlineButton={canRenewDeadline} // Passar a flag diretamente
          onRenewalComplete={() => refreshProcesses()}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
