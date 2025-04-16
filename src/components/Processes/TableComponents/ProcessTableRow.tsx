
import { TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";
import ProcessTypePicker from "../ProcessTypePicker";
import ProcessActionButtons from "../ProcessActionButtons";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";
import ProcessDepartmentCellComponent from "./ProcessDepartmentCell";

interface ProcessTableRowProps {
  process: Process;
  sortedDepartments: Department[];
  getMostRecentEntryDate: (process: Process, departmentId: string) => string | null;
  getProcessTypeName: (id: string) => string;
  getProcessResponsible: (processId: string) => ProcessResponsible | null | undefined;
  getSectorResponsible: (processId: string, sectorId: string) => ProcessResponsible | null | undefined;
  departments: Department[];
  concludedDept?: Department | undefined;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
}

const ProcessTableRow = ({
  process,
  sortedDepartments,
  getMostRecentEntryDate,
  getProcessTypeName,
  getProcessResponsible,
  getSectorResponsible,
  departments,
  concludedDept,
  processTypes,
  updateProcessType,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  startProcess
}: ProcessTableRowProps) => {
  const navigate = useNavigate();

  const handleRowClick = (processId: string) => {
    navigate(`/processes/${processId}`);
  };

  // Função para definir a cor de fundo com base no status
  const getRowBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-200";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    if (status === "not_started") return "bg-green-200";
    return "";
  };

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
      
      {/* Células para cada departamento */}
      {sortedDepartments.map(dept => (
        <TableCell key={dept.id}>
          <ProcessDepartmentCellComponent 
            process={process}
            department={dept}
            getMostRecentEntryDate={getMostRecentEntryDate}
            getProcessResponsible={getProcessResponsible}
            getSectorResponsible={getSectorResponsible}
            departments={departments}
          />
        </TableCell>
      ))}
      
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
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
