
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import ProcessTableBody from "./ProcessTableBody";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("ProcessTable");

interface ProcessTableProps {
  processes: Process[];
  departments: Department[];
  processTypes: ProcessType[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getProcessTypeName: (id: string) => string;
  getDepartmentName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess?: (processId: string) => Promise<void>;
  filterProcesses: (filters: any, processes: Process[], processesResponsibles?: Record<string, any>) => Promise<Process[]>;
  filters: any;
  isUserInAttendanceSector?: () => boolean;
  processesResponsibles?: Record<string, Record<string, any>>;
}

const ProcessTable = ({
  processes,
  departments,
  processTypes,
  sortField,
  sortDirection,
  toggleSort,
  getProcessTypeName,
  getDepartmentName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  updateProcessType,
  updateProcessStatus,
  startProcess,
  filterProcesses,
  filters,
  isUserInAttendanceSector,
  processesResponsibles
}: ProcessTableProps) => {
  logger.debug(`ProcessTable renderizado com ${processes.length} processos`);
  
  // Log de dados de responsáveis recebidos via props
  if (processesResponsibles) {
    logger.debug(`ProcessTable recebeu processesResponsibles com ${Object.keys(processesResponsibles).length} processos`);
  }
  
  const { processesResponsibles: localProcessesResponsibles, isLoading, queueSectorForLoading } = useProcessTableState(processes);
  
  // Log de dados de responsáveis carregados localmente
  logger.debug(`ProcessTable carregou localProcessesResponsibles com ${Object.keys(localProcessesResponsibles).length} processos`);

  // Usar os responsáveis passados como propriedade, se disponíveis, ou os carregados localmente
  const effectiveResponsibles = processesResponsibles || localProcessesResponsibles;
  
  logger.debug(`ProcessTable usando effectiveResponsibles com ${Object.keys(effectiveResponsibles).length} processos`);
  
  // Log detalhado do primeiro processo (como amostra)
  if (Object.keys(effectiveResponsibles).length > 0) {
    const sampleProcessId = Object.keys(effectiveResponsibles)[0];
    logger.debug(`Exemplo - Processo ${sampleProcessId}: ${Object.keys(effectiveResponsibles[sampleProcessId] || {}).length} setores`);
  } else {
    logger.warn("NENHUM RESPONSÁVEL DISPONÍVEL PARA EXIBIÇÃO");
  }

  return (
    <div className="border rounded-md overflow-x-auto">
      <Table className="min-w-full table-fixed">
        <ProcessTableHeader 
          departments={departments}
          getDepartmentName={getDepartmentName}
          sortField={sortField}
          sortDirection={sortDirection}
          toggleSort={toggleSort}
        />
        
        <ProcessTableBody 
          processes={processes}
          departments={departments}
          processTypes={processTypes}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          processesResponsibles={effectiveResponsibles}
          sortField={sortField}
          sortDirection={sortDirection}
          queueSectorForLoading={queueSectorForLoading}
          isLoading={isLoading}
          canInitiateProcesses={isUserInAttendanceSector?.()}
        />
      </Table>
    </div>
  );
};

export default ProcessTable;
