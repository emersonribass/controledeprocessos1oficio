
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessActionButtons from "./ProcessActionButtons";
import ProcessTypePicker from "./ProcessTypePicker";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

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
  processResponsibles
}: ProcessTableRowProps) => {
  const navigate = useNavigate();

  // Verificar se é o primeiro departamento
  const isFirstDepartment = departments[0]?.id === process.currentDepartment;

  // Verificar se é o último departamento
  const isLastDepartment = departments[departments.length - 1]?.id === process.currentDepartment;

  const handleRowClick = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.process-action')) {
      return;
    }
    navigate(`/processes/${process.id}`);
  };

  return (
    <TableRow 
      className={cn(
        "cursor-pointer hover:bg-gray-100"
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
      
      {departments.map((dept) => {
        const hasPassedDepartment = process.history.some(h => h.departmentId === dept.id);
        const isCurrentDepartment = process.currentDepartment === dept.id;
        
        return (
          <TableCell key={dept.id} className="min-w-[120px] text-center">
            {isCurrentDepartment ? "Atual" : hasPassedDepartment ? "✓" : ""}
          </TableCell>
        );
      })}
    
      <TableCell className="w-[120px] process-action">
        <ProcessActionButtons 
          processId={process.id}
          protocolNumber={process.protocolNumber}
          processType={process.processType}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          setIsEditing={() => {}}
          isEditing={false}
          status={process.status}
          startProcess={canInitiateProcesses && process.status === 'not_started' ? startProcess : undefined}
          hasSectorResponsible={hasSectorResponsible}
          onAcceptResponsibility={onAcceptResponsibility}
          isAccepting={isAccepting}
          sectorId={process.currentDepartment}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
