
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import ProcessTableBody from "./ProcessTableBody";
import { useProcessManager } from "@/hooks/useProcessManager";

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
  processesResponsibles: externalResponsibles
}: ProcessTableProps) => {
  const { isLoading: isLocalLoading, queueSectorForLoading } = useProcessTableState(processes);
  const { processesResponsibles: managedResponsibles, isLoading: isManagerLoading } = useProcessManager({ 
    processes // Passando um objeto com a propriedade 'processes' conforme esperado pela interface
  });

  // Usar os responsáveis passados como propriedade, se disponíveis, ou os carregados pelo gerente
  const effectiveResponsibles = externalResponsibles || managedResponsibles;
  const isLoading = isLocalLoading || isManagerLoading;

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
