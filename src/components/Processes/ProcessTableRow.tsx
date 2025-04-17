
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessRowActions from "./ProcessRowActions";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import { useProcessRowResponsibility } from "@/hooks/useProcessRowResponsibility";
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
  processResponsibles
}: ProcessTableRowProps) => {
  // ... código existente ...

  return (
    <TableRow>
      {/* ... células existentes ... */}
      <ProcessDepartmentsSection 
        sortedDepartments={sortedDepartments}
        isProcessStarted={process.status !== "not_started"}
        getMostRecentEntryDate={(departmentId) => getMostRecentEntryDate(departmentId)}
        hasPassedDepartment={(departmentId) => hasPassedDepartment(departmentId)}
        isCurrentDepartment={(departmentId) => isCurrentDepartment(departmentId)}
        isPreviousDepartment={(departmentId) => isPreviousDepartment(departmentId)}
        isDepartmentOverdue={(departmentId, isProcessStarted) => isDepartmentOverdue(departmentId, isProcessStarted)}
        processId={process.id}
        processResponsible={processResponsibles?.[process.id]?.initial}
        sectorResponsibles={processResponsibles?.[process.id]}
      />
      {/* ... células existentes ... */}
    </TableRow>
  );
};