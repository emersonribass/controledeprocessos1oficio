
import { useEffect, useState, useCallback } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { useProcessListSorting } from "@/hooks/useProcessListSorting";
import { useProcessTableState } from "@/hooks/useProcessTableState";
import { useAuth } from "@/hooks/auth";
import { Process } from "@/types";
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
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    isLoading: isLoadingProcesses,
    processTypes,
    updateProcessType,
    updateProcessStatus,
    departments,
    startProcess,
    filterProcesses,
    isUserInAttendanceSector
  } = useProcesses();

  const { user, isAdmin } = useAuth();
  const { filters, setFilters } = useProcessListFilters(initialFilters);
  const { sortField, sortDirection, toggleSort, sortProcesses } = useProcessListSorting();
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(true);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);
  const { processesResponsibles } = useProcessTableState(processes);

  const loadFilteredProcesses = useCallback(async () => {
    setIsLoadingFiltered(true);
    try {
      const filtered = await filterProcesses(filters, processes, processesResponsibles);
      const sorted = sortProcesses(filtered);
      setFilteredProcesses(sorted);
    } catch (error) {
      console.error("Erro ao filtrar processos:", error);
      setFilteredProcesses([]);
    } finally {
      setIsLoadingFiltered(false);
    }
  }, [filters, processes, processesResponsibles, filterProcesses, sortProcesses]);

  useEffect(() => {
    loadFilteredProcesses();
  }, [loadFilteredProcesses]);

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
        isLoading={isLoadingProcesses || isLoadingFiltered}
        filteredProcesses={filteredProcesses}
        filters={filters}
        setFilters={setFilters}
        sortField={sortField}
        sortDirection={sortDirection}
        toggleSort={toggleSort as (field: keyof Process) => void}
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
        isUserInAttendanceSector={isUserInAttendanceSector}
        processesResponsibles={processesResponsibles}
      />
    </div>
  );
};

export default ProcessList;
