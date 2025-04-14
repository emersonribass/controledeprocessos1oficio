
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import ProcessTypePicker from "./ProcessTypePicker";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessRowActions from "./ProcessRowActions";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import { useProcessRowResponsibility } from "@/hooks/useProcessRowResponsibility";

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
  isAccepting
}: ProcessTableRowProps) => {
  const navigate = useNavigate();
  
  // Usar o hook para verificar responsabilidade
  const { hasSectorResponsible } = useProcessRowResponsibility(process);
  
  const {
    sortedDepartments,
    concludedDept,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  } = useProcessDepartmentInfo(process, departments);

  // Função para definir a cor de fundo com base no status
  const getRowBackgroundColor = (status: string) => {
    if (status === "completed") return "bg-green-200";
    if (status === "overdue") return "bg-red-200";
    if (status === "pending") return "bg-blue-200";
    return "";
  };

  const handleRowClick = (e: React.MouseEvent) => {
    // Não navegar se o clique foi em um elemento de ação (botões, selects, etc)
    if ((e.target as HTMLElement).closest('.process-action')) {
      e.stopPropagation();
      return;
    }
    
    navigate(`/processes/${process.id}`);
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-100",
        getRowBackgroundColor(process.status)
      )}
      onClick={handleRowClick}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell className="process-action" onClick={e => e.stopPropagation()}>
        <ProcessTypePicker 
          processId={process.id} 
          currentTypeId={process.processType} 
          processTypes={processTypes} 
          getProcessTypeName={getProcessTypeName} 
          updateProcessType={updateProcessType} 
        />
      </TableCell>
      
      <ProcessDepartmentsSection 
        sortedDepartments={sortedDepartments}
        isProcessStarted={process.status !== "not_started"}
        getMostRecentEntryDate={(departmentId) => getMostRecentEntryDate(departmentId)}
        hasPassedDepartment={(departmentId) => hasPassedDepartment(departmentId)}
        isCurrentDepartment={(departmentId) => isCurrentDepartment(departmentId)}
        isPreviousDepartment={(departmentId) => isPreviousDepartment(departmentId)}
        isDepartmentOverdue={(departmentId, isProcessStarted) => isDepartmentOverdue(departmentId, isProcessStarted)}
      />
      
      <ProcessRowActions 
        processId={process.id}
        protocolNumber={process.protocolNumber}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        isFirstDepartment={isFirstDepartment}
        isLastDepartment={isLastDepartment}
        status={process.status}
        startProcess={startProcess}
        hasSectorResponsible={hasSectorResponsible}
        onAcceptResponsibility={onAcceptResponsibility}
        isAccepting={isAccepting}
        sectorId={process.currentDepartment}
      />
    </TableRow>
  );
};

export default ProcessTableRow;
