
import { Table } from "@/components/ui/table";
import { Process, ProcessType, Department } from "@/types";
import ProcessTableHeader from "./ProcessTableHeader";
import ProcessTableBody from "./ProcessTableBody";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import { useEffect, useState } from "react";
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
  ) => Promise<Process[]>;
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
  const { processesResponsibles, fetchResponsibles, queueSectorForLoading } = useProcessTableState(processes);
  const { isUserInAttendanceSector } = useProcessFiltering(processes);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Função para aplicar os filtros e ordenar os resultados
  const loadFilteredProcesses = async () => {
    setIsLoading(true);
    try {
      // Filtrar processos com base nas permissões e filtros
      const filtered = await filterProcesses(filters, processes, processesResponsibles);
      
      // Ordenar os processos
      const sorted = [...filtered].sort((a, b) => {
        // Comparador para ordenação
        const aValue = a[sortField];
        const bValue = b[sortField];
        
        if (aValue === bValue) return 0;
        
        const direction = sortDirection === 'asc' ? 1 : -1;
        
        // Tratamento para diferentes tipos de valores
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return aValue.localeCompare(bValue) * direction;
        }
        
        // Para datas
        if (sortField === 'startDate' || sortField === 'expectedEndDate') {
          const aDate = new Date(aValue as string);
          const bDate = new Date(bValue as string);
          return (aDate.getTime() - bDate.getTime()) * direction;
        }
        
        // Para outros tipos
        return ((aValue as any) > (bValue as any) ? 1 : -1) * direction;
      });
      
      setFilteredProcesses(sorted);
    } catch (error) {
      console.error("Erro ao filtrar processos:", error);
      setFilteredProcesses([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Buscar responsáveis quando os processos mudarem
  useEffect(() => {
    if (processes.length > 0) {
      fetchResponsibles();
    }
  }, [processes, fetchResponsibles]);
  
  // Aplicar filtros e ordenação quando qualquer dependência mudar
  useEffect(() => {
    loadFilteredProcesses();
  }, [filters, processes, processesResponsibles, sortField, sortDirection]);
  
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
