
import { useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { useProcessListSorting } from "@/hooks/useProcessListSorting";
import { useAuth } from "@/hooks/auth";
import ProcessListHeader from "./ProcessListHeader";
import ProcessListContent from "./ProcessListContent";

interface ProcessListProps {
  initialFilters?: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  };
}

const ProcessList = ({ initialFilters = {} }: ProcessListProps) => {
  const {
    processes,
    filterProcesses,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    isLoading,
    processTypes,
    updateProcessType,
    updateProcessStatus,
    departments,
    startProcess
  } = useProcesses();

  const { user, isAdmin } = useAuth();
  const { filters, setFilters } = useProcessListFilters(initialFilters);
  const { sortField, sortDirection, toggleSort, sortProcesses } = useProcessListSorting();

  // IMPORTANTE: Primeiro aplicar filtros, depois ordenar os resultados
  // Isso garante que processos recém-iniciados apareçam no topo da lista
  const filteredProcesses = sortProcesses(filterProcesses(filters, processes));

  // Determinar os departamentos disponíveis para o usuário atual
  const availableDepartments = isAdmin(user?.email || "") || !user?.departments?.length 
    ? departments 
    : departments.filter(dept => user?.departments.includes(dept.id));

  return (
    <div className="space-y-6">
      <ProcessListHeader
        title="Processos"
        description="Gerencie e acompanhe o andamento de todos os processos."
      />

      <ProcessListContent
        processes={processes}
        isLoading={isLoading}
        filteredProcesses={filteredProcesses}
        filters={filters}
        setFilters={setFilters}
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
        availableDepartments={availableDepartments}
        filterProcesses={filterProcesses}
      />
    </div>
  );
};

export default ProcessList;
