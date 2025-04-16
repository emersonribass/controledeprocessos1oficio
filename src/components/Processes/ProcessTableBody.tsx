
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useProcessBatchLoaderContext } from "@/contexts/ProcessBatchLoaderContext";
import { useAuth } from "@/hooks/auth";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  isUserInAttendanceSector?: () => boolean;
}

const ProcessTableBody = ({
  processes,
  departments,
  processTypes,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  getProcessTypeName,
  updateProcessType,
  startProcess,
  isUserInAttendanceSector = () => false
}: ProcessTableBodyProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [acceptingProcessId, setAcceptingProcessId] = useState<string | null>(null);
  
  const {
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading
  } = useProcessBatchLoaderContext();
  
  // Pré-carrega todos os responsáveis necessários
  useEffect(() => {
    if (processes.length === 0) return;
    
    // Prepara cada processo para carregamento
    processes.forEach(process => {
      queueProcessForLoading(process.id);
      
      if (process.currentDepartment) {
        queueSectorForLoading(process.id, process.currentDepartment);
      }
    });
  }, [processes, queueProcessForLoading, queueSectorForLoading]);
  
  // Função para verificar se existe um responsável para o processo no setor atual
  const hasSectorResponsible = (processId: string, currentDepartment: string) => {
    return !!getSectorResponsible(processId, currentDepartment);
  };

  if (processes.length === 0) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={departments.length + 3} className="h-24 text-center">
            Nenhum processo encontrado
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

  return (
    <TableBody>
      {processes.map(process => (
        <ProcessTableRow
          key={process.id}
          process={process}
          departments={departments}
          processTypes={processTypes}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          hasSectorResponsible={hasSectorResponsible(process.id, process.currentDepartment)}
          isAccepting={!!acceptingProcessId && acceptingProcessId === process.id}
          canInitiateProcesses={isUserInAttendanceSector()}
          sectorResponsible={getSectorResponsible(process.id, process.currentDepartment) || null}
          processResponsible={getProcessResponsible(process.id) || null}
        />
      ))}
    </TableBody>
  );
};

export default ProcessTableBody;
