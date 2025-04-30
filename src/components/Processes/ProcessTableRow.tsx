
import { TableRow, TableCell } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessStatusBadge from "./ProcessStatusBadge";
import ProcessRowActions from "./ProcessRowActions";
import { Link } from "react-router-dom";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible: boolean;
  onAcceptResponsibility: () => Promise<void>;
  isAccepting: boolean;
  processResponsibles?: Record<string, any>;
  canInitiateProcesses?: boolean;
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
  hasSectorResponsible,
  onAcceptResponsibility,
  isAccepting,
  processResponsibles,
  canInitiateProcesses
}: ProcessTableRowProps) => {
  const {
    sortedDepartments,
    isFirstDepartment,
    isLastDepartment,
    isProcessCompleted,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  // Verificar se o processo foi iniciado
  const isProcessStarted = process.status !== "not_started";
  const isOverdue = process.status === "overdue";

  return (
    <TableRow>
      <TableCell>
        <Link to={`/process/${process.id}`} className="hover:underline text-primary">
          {process.protocolNumber || "Sem protocolo"}
        </Link>
      </TableCell>
      <TableCell>
        <ProcessTypePicker
          processId={process.id}
          currentTypeId={process.processType}
          processTypes={processTypes}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          isDisabled={process.status === "completed"}
        />
      </TableCell>
      <TableCell>
        <ProcessStatusBadge status={process.status} />
      </TableCell>
      <ProcessDepartmentsSection
        sortedDepartments={sortedDepartments}
        isProcessStarted={isProcessStarted}
        getMostRecentEntryDate={getMostRecentEntryDate}
        hasPassedDepartment={hasPassedDepartment}
        isCurrentDepartment={isCurrentDepartment}
        isPreviousDepartment={isPreviousDepartment}
        isDepartmentOverdue={isDepartmentOverdue}
        processId={process.id}
        processResponsible={processResponsibles?.initial}
        sectorResponsibles={processResponsibles}
        isProcessCompleted={isProcessCompleted}
      />
      <TableCell>
        <ProcessRowActions
          processId={process.id}
          protocolNumber={process.protocolNumber}
          processType={process.processType}
          moveProcessToPreviousDepartment={() => moveProcessToPreviousDepartment(process.id)}
          moveProcessToNextDepartment={() => moveProcessToNextDepartment(process.id)}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          status={process.status}
          startProcess={startProcess ? () => startProcess(process.id) : undefined}
          hasSectorResponsible={hasSectorResponsible}
          onAcceptResponsibility={onAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
          isOverdue={isOverdue}
          currentDepartment={process.currentDepartment}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
