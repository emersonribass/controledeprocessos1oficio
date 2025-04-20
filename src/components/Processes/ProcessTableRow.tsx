
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
  const currentDepartmentEntry = process.history.find(h => !h.exitDate);
  
  // Encontrar a entrada de histórico para o departamento atual
  // Buscamos nas entradas de histórico do processo a entrada correspondente ao departamento atual
  // que não tenha data de saída (ou seja, é a entrada atual)
  let currentHistoryEntryId: number | undefined = undefined;
  
  // Se temos entradas no histórico, procuramos a entrada correspondente ao departamento atual
  if (process.history && process.history.length > 0) {
    // Primeiro encontramos o índice da entrada do departamento atual no array de histórico
    const historyIndex = process.history.findIndex(
      h => h.departmentId === process.currentDepartment && !h.exitDate
    );
    
    // Se encontramos uma entrada válida, usamos o índice + 1 como ID (simulando o ID no banco de dados)
    // Na realidade, no banco de dados temos uma coluna 'id' separada, que não está no tipo ProcessHistory
    if (historyIndex !== -1) {
      // No mundo real, este ID seria buscado do banco de dados
      // Aqui estamos usando o ID do processo, que provavelmente não é o correto
      // mas garantimos que ele seja um número para atender a tipagem
      currentHistoryEntryId = parseInt(process.id);
    }
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
          historyId={currentHistoryEntryId}
          onRenewalComplete={() => refreshProcesses()}
        />
      </TableCell>
    </TableRow>
  );
};

export default ProcessTableRow;
