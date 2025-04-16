import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

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
  const { getProcessResponsible, getSectorResponsible } = useProcessResponsibility();
  const [departmentResponsibles, setDepartmentResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [processResponsible, setProcessResponsible] = useState<ProcessResponsible | null>(null);
  const [isLoadingResponsibles, setIsLoadingResponsibles] = useState(false);

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

  // Buscar responsáveis quando o componente é montado
  useEffect(() => {
    const fetchResponsibles = async () => {
      setIsLoadingResponsibles(true);
      try {
        // Buscar o responsável pelo processo
        const responsible = await getProcessResponsible(process.id);
        setProcessResponsible(responsible);
        
        // Buscar responsáveis por departamento
        const deptResp: Record<string, ProcessResponsible | null> = {};
        for (const dept of sortedDepartments) {
          const sectorResp = await getSectorResponsible(process.id, dept.id);
          deptResp[dept.id] = sectorResp;
        }
        setDepartmentResponsibles(deptResp);
      } catch (error) {
        console.error("Erro ao buscar responsáveis:", error);
      } finally {
        setIsLoadingResponsibles(false);
      }
    };
    
    fetchResponsibles();
  }, [process.id, getProcessResponsible, getSectorResponsible, sortedDepartments]);

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
        sortedDepartments={sortedDepartments}
        isProcessStarted={isProcessStarted}
        getMostRecentEntryDate={getMostRecentEntryDate}
        hasPassedDepartment={hasPassedDepartment}
        isCurrentDepartment={isCurrentDepartment}
        isPreviousDepartment={isPreviousDepartment}
        isDepartmentOverdue={isDepartmentOverdue}
        processResponsible={processResponsible}
        departmentResponsibles={departmentResponsibles}
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
