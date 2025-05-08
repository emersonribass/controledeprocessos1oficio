
import { TableBody, TableRow, TableCell } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableRow from "./ProcessTableRow";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { createLogger } from "@/utils/loggerUtils";
import { useProcessManager } from "@/hooks/useProcessManager";

const logger = createLogger("ProcessTableBody");

interface ProcessTableBodyProps {
  processes: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  getProcessTypeName: (id: string) => string;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  processesResponsibles: Record<string, any>;
  isUserInAttendanceSector?: () => boolean;
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  queueSectorForLoading: (processId: string, sectorId: string) => void;
  isLoading: boolean;
  canInitiateProcesses?: boolean;
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
  processesResponsibles,
  isUserInAttendanceSector = () => false,
  sortField,
  sortDirection,
  queueSectorForLoading,
  isLoading,
  canInitiateProcesses
}: ProcessTableBodyProps) => {
  const { acceptResponsibility, hasSectorResponsible, refreshResponsibles } = useProcessManager(processes);
  const [acceptingProcessId, setAcceptingProcessId] = useState<string | null>(null);
  
  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async (processId: string, sectorId: string, protocolNumber?: string) => {
    if (!sectorId) return;
    
    setAcceptingProcessId(processId);
    try {
      await acceptResponsibility(processId, sectorId);
      // Atualizar cache de responsáveis
      queueSectorForLoading(processId, sectorId);
      await refreshResponsibles();
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    } finally {
      setAcceptingProcessId(null);
    }
  };

  if (isLoading) {
    return (
      <TableBody>
        <TableRow>
          <TableCell colSpan={departments.length + 3} className="h-24 text-center">
            <div className="flex justify-center items-center">
              <Loader2 className="h-6 w-6 animate-spin mr-2" />
              Carregando processos...
            </div>
          </TableCell>
        </TableRow>
      </TableBody>
    );
  }

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
      {processes.map(process => {
        // Verificar se o processo tem responsável no setor atual
        const hasResponsible = hasSectorResponsible(process.id, process.currentDepartment);
        logger.debug(`Processo ${process.id}: hasSectorResponsible=${hasResponsible}, currentDepartment=${process.currentDepartment}`);
        
        return (
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
            hasSectorResponsible={hasResponsible}
            onAcceptResponsibility={() => handleAcceptResponsibility(process.id, process.currentDepartment)}
            isAccepting={acceptingProcessId === process.id}
            canInitiateProcesses={isUserInAttendanceSector()}
            processResponsibles={processesResponsibles[process.id]}
          />
        );
      })}
    </TableBody>
  );
};

export default ProcessTableBody;
