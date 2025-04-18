
import { Table, TableHeader, TableBody } from "@/components/ui/table";
import { Process, Department, ProcessType } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import ProcessTableBody from "./ProcessTableBody";

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
  filters
}: ProcessTableProps) => {
  const { processesResponsibles, isLoading, queueSectorForLoading } = useProcessTableState(processes);
  
  // Adicionar console.log para debug
  console.log("ProcessTable - processesResponsibles:", processesResponsibles);

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <ProcessTableHeader 
            departments={departments}
            getDepartmentName={getDepartmentName}
            sortField={sortField}
            sortDirection={sortDirection}
            toggleSort={toggleSort}
          />
        </TableHeader>
        
        <ProcessTableBody 
          processes={processes}
          departments={departments}
          processTypes={processTypes}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          processesResponsibles={processesResponsibles}
          sortField={sortField}
          sortDirection={sortDirection}
          queueSectorForLoading={queueSectorForLoading}
          isLoading={isLoading}
        />
      </Table>
    </div>
  );
};

export default ProcessTable;
