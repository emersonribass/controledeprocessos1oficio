
import { Table } from "@/components/ui/table";
import { Department, Process, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import { useProcessBatchLoader } from "@/hooks/useProcessBatchLoader";
import ProcessTableBody from "./TableComponents/ProcessTableBody";

interface ProcessTableProps {
  processes: Process[];
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: ProcessType[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  departments: Department[];
  startProcess?: (processId: string) => Promise<void>;
  filterProcesses?: (
    filters: any, 
    processesToFilter?: Process[]
  ) => Process[];
  filters?: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
}

const ProcessTable = ({
  processes,
  sortField,
  sortDirection,
  toggleSort,
  getDepartmentName,
  getProcessTypeName,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  processTypes,
  updateProcessType,
  updateProcessStatus,
  departments,
  startProcess,
  filterProcesses,
  filters
}: ProcessTableProps) => {
  const {
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading
  } = useProcessBatchLoader();
  
  return (
    <div className="rounded-md border overflow-x-auto">
      <Table>
        <ProcessTableHeader 
          sortField={sortField} 
          sortDirection={sortDirection} 
          toggleSort={toggleSort} 
          departments={departments} 
        />
        <ProcessTableBody 
          processes={processes}
          departments={departments}
          sortField={sortField}
          sortDirection={sortDirection}
          getDepartmentName={getDepartmentName}
          getProcessTypeName={getProcessTypeName}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          processTypes={processTypes}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          getProcessResponsible={getProcessResponsible}
          getSectorResponsible={getSectorResponsible}
          queueProcessForLoading={queueProcessForLoading}
          queueSectorForLoading={queueSectorForLoading}
        />
      </Table>
    </div>
  );
};

export default ProcessTable;
