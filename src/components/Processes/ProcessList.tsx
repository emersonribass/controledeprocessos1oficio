
import { useEffect, useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { useProcessListSorting } from "@/hooks/useProcessListSorting";
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
  const { sortProcesses } = useProcessListSorting();
  const [isLoadingFiltered, setIsLoadingFiltered] = useState(true);
  const [filteredProcesses, setFilteredProcesses] = useState<Process[]>([]);

  // Efeito para aplicar filtros e ordenação de forma assíncrona
  useEffect(() => {
    const loadFilteredProcesses = async () => {
      setIsLoadingFiltered(true);
      try {
        // Filtrar processos com o método assíncrono
        const filtered = await filterProcesses(filters, processes);
        // Aplicar ordenação nos processos filtrados
        const sortedProcesses = sortProcesses(filtered);
        setFilteredProcesses(sortedProcesses);
      } catch (error) {
        console.error("Erro ao filtrar processos:", error);
        setFilteredProcesses([]);
      } finally {
        setIsLoadingFiltered(false);
      }
    };

    loadFilteredProcesses();
  }, [processes, filters, filterProcesses, sortProcesses]);

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
        processes={filteredProcesses}
        isLoading={isLoadingProcesses || isLoadingFiltered}
        filteredProcesses={filteredProcesses}
        filters={filters}
        setFilters={setFilters}
        // Agora passamos valores fixos para sortField e sortDirection
        sortField="protocolNumber"
        sortDirection="asc"
        // E uma função vazia para toggleSort já que não vamos mais alternar
        toggleSort={() => {}}
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
      />
    </div>
  );
};

export default ProcessList;
