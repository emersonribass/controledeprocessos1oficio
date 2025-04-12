
import { useState } from "react";
import { TableCell, TableRow } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import { cn } from "@/lib/utils";
import ProcessTypePicker from "./ProcessTypePicker";
import { useProcessRowResponsibility } from "@/hooks/useProcessRowResponsibility";
import { useProcessDepartmentInfo } from "@/hooks/useProcessDepartmentInfo";
import ProcessDepartmentsSection from "./ProcessDepartmentsSection";
import ProcessRowActions from "./ProcessRowActions";

interface ProcessTableRowProps {
  process: Process;
  departments: Department[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
}

const ProcessTableRow = ({
  process,
  departments,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  updateProcessStatus,
  startProcess,
}: ProcessTableRowProps) => {
  const isNotStarted = process.status === "not_started";
  const isProcessStarted = !isNotStarted;

  // Hook para lidar com responsáveis do processo
  const {
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting
  } = useProcessRowResponsibility(process.id, process.currentDepartment);

  // Hook para lidar com informações de departamento
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

  // Define a cor de fundo com base no status do processo
  const getRowBackgroundColor = () => {
    if (process.status === "completed") return "bg-green-300";
    if (process.status === "overdue") return "bg-red-300";
    if (process.status === "pending") return "bg-blue-300";
    return "";
  };

  // Adaptadores para garantir que as funções retornem Promise<void>
  const handleMoveToNext = async (processId: string): Promise<void> => {
    await moveProcessToNextDepartment(processId);
  };
  
  const handleMoveToPrevious = async (processId: string): Promise<void> => {
    await moveProcessToPreviousDepartment(processId);
  };
  
  const handleStartProcess = async (processId: string): Promise<void> => {
    if (startProcess) {
      await startProcess(processId);
    }
  };

  const handleAcceptProcessResponsibility = async (): Promise<void> => {
    await handleAcceptResponsibility(process.protocolNumber);
  };

  return (
    <TableRow
      key={process.id}
      className={cn(getRowBackgroundColor())}
    >
      <TableCell className="font-medium">
        {process.protocolNumber}
      </TableCell>
      <TableCell>
        <ProcessTypePicker
          processId={process.id}
          currentTypeId={process.processType}
          processTypes={processTypes}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
        />
      </TableCell>
      
      {/* Seção de departamentos */}
      <ProcessDepartmentsSection 
        sortedDepartments={sortedDepartments}
        isProcessStarted={isProcessStarted}
        getMostRecentEntryDate={getMostRecentEntryDate}
        hasPassedDepartment={hasPassedDepartment}
        isCurrentDepartment={isCurrentDepartment}
        isPreviousDepartment={isPreviousDepartment}
        isDepartmentOverdue={isDepartmentOverdue}
      />
      
      {/* Ações do processo */}
      <ProcessRowActions 
        processId={process.id}
        protocolNumber={process.protocolNumber}
        moveProcessToPreviousDepartment={handleMoveToPrevious}
        moveProcessToNextDepartment={handleMoveToNext}
        isFirstDepartment={isFirstDepartment}
        isLastDepartment={isLastDepartment}
        status={process.status}
        startProcess={handleStartProcess}
        hasSectorResponsible={!!sectorResponsible}
        onAcceptResponsibility={handleAcceptProcessResponsibility}
        isAccepting={isAccepting}
        sectorId={process.currentDepartment}
      />
    </TableRow>
  );
};

export default ProcessTableRow;
