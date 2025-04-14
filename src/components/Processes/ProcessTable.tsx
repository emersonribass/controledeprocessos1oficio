
import { Table } from "@/components/ui/table";
import { Process, ProcessType, Department } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableBody from "./ProcessTableBody";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import { useEffect } from "react";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";

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
  filterProcesses: (
    filters: any, 
    processes: Process[], 
    processesResponsibles?: Record<string, any>
  ) => Process[];
  filters: any;
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
  departments,
  startProcess,
  filterProcesses,
  filters
}: ProcessTableProps) => {
  const { processesResponsibles, fetchResponsibles } = useProcessTableState(processes);
  const { isUserInAttendanceSector } = useProcessFiltering(processes);
  
  // Buscar responsáveis quando os processos mudarem
  useEffect(() => {
    if (processes.length > 0) {
      fetchResponsibles();
    }
  }, [processes, fetchResponsibles]);
  
  // Aplicar filtros considerando as responsabilidades
  const filteredProcesses = filterProcesses(filters, processes, processesResponsibles);
  
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
          processes={filteredProcesses}
          departments={departments}
          processTypes={processTypes}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          getProcessTypeName={getProcessTypeName}
          updateProcessType={updateProcessType}
          startProcess={startProcess}
          processesResponsibles={processesResponsibles}
          isUserInAttendanceSector={isUserInAttendanceSector}
        />
      </Table>
    </div>
  );
};

export default ProcessTable;
