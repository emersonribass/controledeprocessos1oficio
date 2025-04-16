
import { TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import { Link } from "react-router-dom";
import { useState } from "react";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessStatusBadge from "./ProcessStatusBadge";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";
import ProcessTypePicker from "./ProcessTypePicker";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  sectorResponsible?: ProcessResponsible | null;
  processResponsible?: ProcessResponsible | null;
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
  sectorResponsible = null,
  processResponsible = null
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
  
  // Formatar data para exibição
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return dateString;
    }
  };
  
  // Determinar dias restantes
  const getRemainingDays = (departmentId: string) => {
    if (!isProcessStarted || !isCurrentDepartment(departmentId)) return null;
    
    const dept = departments.find(d => d.id === departmentId);
    if (!dept || !dept.timeLimit) return null;
    
    const entryDate = getMostRecentEntryDate(departmentId);
    if (!entryDate) return null;
    
    return `${dept.timeLimit} dia(s) restante(s)`;
  };
  
  // Determinar cores da linha com base no status do processo
  const getRowColor = () => {
    switch (process.status) {
      case 'completed':
        return 'bg-green-50 hover:bg-green-100';
      case 'overdue':
        return 'bg-red-50 hover:bg-red-100';
      case 'not_started':
        return 'bg-gray-50 hover:bg-gray-100';
      default:
        return 'bg-blue-50 hover:bg-blue-100';
    }
  };

  // Função de clique para a linha inteira
  const handleRowClick = () => {
    window.location.href = `/processes/${process.id}`;
  };

  return (
    <TableRow 
      className={`cursor-pointer ${getRowColor()}`} 
      onClick={handleRowClick}
    >
      <TableCell>
        <div className="font-medium">{process.protocolNumber}</div>
      </TableCell>
      <TableCell>
        {isEditing ? (
          <ProcessTypePicker
            processId={process.id}
            currentTypeId={process.processType}
            processTypes={processTypes}
            getProcessTypeName={getProcessTypeName}
            updateProcessType={updateProcessType}
          />
        ) : (
          <div 
            className="w-full flex items-center justify-between"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setIsEditing(true);
            }}
          >
            <span>{getProcessTypeName(process.processType)}</span>
            <span className="text-gray-400 hover:text-gray-600 cursor-pointer">✏️</span>
          </div>
        )}
      </TableCell>
      <TableCell>
        <div className="flex flex-col">
          <span>{formatDate(process.startDate)}</span>
          <ProcessStatusBadge status={process.status} />
        </div>
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
        processResponsible={processResponsible}
        sectorResponsible={sectorResponsible}
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
