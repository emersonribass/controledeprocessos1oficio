
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { Link } from "react-router-dom";
import { useState } from "react";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessStatusBadge from "./ProcessStatusBadge";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible?: boolean;
  onAcceptResponsibility?: () => Promise<void>;
  isAccepting?: boolean;
  canInitiateProcesses?: boolean;
  sectorResponsible?: any;
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
  hasSectorResponsible = false,
  onAcceptResponsibility,
  isAccepting = false,
  canInitiateProcesses = false,
  sectorResponsible
}: ProcessTableRowProps) => {
  const [isEditing, setIsEditing] = useState(false);

  // Extrair informações sobre departamentos
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

  const isProcessStarted = process.status !== 'not_started';

  return (
    <TableRow className="cursor-pointer hover:bg-gray-50">
      <TableCell>
        <Link to={`/processes/${process.id}`} className="block w-full h-full">
          {process.protocolNumber}
        </Link>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <select
            value={process.processType}
            onChange={(e) => {
              updateProcessType(process.id, e.target.value);
              setIsEditing(false);
            }}
            className="w-full p-2 border rounded"
          >
            {processTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        ) : (
          <Link to={`/processes/${process.id}`} className="block w-full h-full">
            {getProcessTypeName(process.processType)}
          </Link>
        )}
      </TableCell>
      <TableCell>
        <Link to={`/processes/${process.id}`} className="block w-full h-full">
          <ProcessStatusBadge status={process.status} />
        </Link>
      </TableCell>

      <ProcessDepartmentsSection
        processId={process.id}
        sortedDepartments={sortedDepartments}
        isProcessStarted={isProcessStarted}
        getMostRecentEntryDate={getMostRecentEntryDate}
        hasPassedDepartment={hasPassedDepartment}
        isCurrentDepartment={isCurrentDepartment}
        isPreviousDepartment={isPreviousDepartment}
        isDepartmentOverdue={isDepartmentOverdue}
      />

      <TableCell>
        <ProcessActionButtons
          processId={process.id}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          setIsEditing={setIsEditing}
          isEditing={isEditing}
          status={process.status}
          startProcess={startProcess}
          hasSectorResponsible={hasSectorResponsible}
          protocolNumber={process.protocolNumber}
          onAcceptResponsibility={onAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
          sectorResponsible={sectorResponsible}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
