import { Loader2 } from "lucide-react";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import { Process, Department } from "@/types";

interface ProcessListContentProps {
  processes: Process[];
  isLoading: boolean;
  filteredProcesses: Process[];
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  }>>;
  sortField: keyof Process;
  sortDirection: "asc" | "desc";
  toggleSort: (field: keyof Process) => void;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  processTypes: any[];
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus?: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  departments: Department[];
  startProcess?: (processId: string) => Promise<void>;
  availableDepartments: Department[];
  filterProcesses: (
    filters: any, 
    processes: Process[], 
    processesResponsibles?: Record<string, any>
  ) => Process[];
}

const ProcessListContent = ({
  processes,
  isLoading,
  filteredProcesses,
  filters,
  setFilters,
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
  availableDepartments,
  filterProcesses
}: ProcessListContentProps) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (processes.length === 0) {
    return (
      <div className="space-y-6">
        <ProcessFilters 
          filters={filters} 
          setFilters={setFilters} 
          availableDepartments={availableDepartments}
        />
        <div className="flex justify-center items-center h-64 border rounded-md p-6 mt-4 bg-gray-50">
          <p className="text-muted-foreground text-lg">Nenhum processo encontrado</p>
        </div>
      </div>
    );
  }

  if (filteredProcesses.length === 0) {
    return (
      <div className="space-y-6">
        <ProcessFilters 
          filters={filters} 
          setFilters={setFilters} 
          availableDepartments={availableDepartments}
        />
        <div className="flex justify-center items-center h-64 border rounded-md p-6 mt-4 bg-gray-50">
          <p className="text-muted-foreground text-lg">Nenhum processo corresponde aos filtros selecionados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ProcessFilters 
        filters={filters} 
        setFilters={setFilters}
        availableDepartments={availableDepartments}
      />

      <ProcessTable
        processes={filteredProcesses}
        sortField={sortField}
        sortDirection={sortDirection}
        toggleSort={toggleSort}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        processTypes={processTypes}
        updateProcessType={updateProcessType}
        updateProcessStatus={updateProcessStatus}
        departments={departments}
        startProcess={startProcess}
        filterProcesses={filterProcesses}
        filters={filters}
      />
    </div>
  );
};

export default ProcessListContent;
