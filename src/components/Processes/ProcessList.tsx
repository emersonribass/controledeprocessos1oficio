
import { useEffect, useState } from "react";
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

  // Efeito para aplicar filtros e ordenação de forma assíncrona
  useEffect(() => {
    const loadFilteredProcesses = async () => {
      setIsLoadingFiltered(true);
      try {
        // Filtrar processos com o método assíncrono, passando os responsáveis
        const filtered = await filterProcesses(filters, processes, processesResponsibles);
        
        // Nova lógica de ordenação
        const sortedProcesses = [...filtered].sort((a, b) => {
          // Função auxiliar para definir a prioridade do status
          const getStatusPriority = (status: string): number => {
            switch (status) {
              case 'overdue': return 0; // Maior prioridade
              case 'pending': return 1;
              case 'completed': return 2;
              case 'not_started': return 3; // Menor prioridade
              default: return 4;
            }
          };

          // Primeiro, ordenar por status
          const statusDiff = getStatusPriority(a.status) - getStatusPriority(b.status);
          if (statusDiff !== 0) return statusDiff;

          // Se o status for igual, ordenar por número de protocolo
          const numA = parseInt(a.protocolNumber.replace(/\D/g, ''));
          const numB = parseInt(b.protocolNumber.replace(/\D/g, ''));
          
          // Se ambos são números válidos, compare-os
          if (!isNaN(numA) && !isNaN(numB)) {
            return numA - numB;
          }
          
          // Se algum não é número válido, compare as strings
          return a.protocolNumber.localeCompare(b.protocolNumber);
        });

        setFilteredProcesses(sortedProcesses);
      } catch (error) {
        console.error("Erro ao filtrar processos:", error);
        setFilteredProcesses([]);
      } finally {
        setIsLoadingFiltered(false);
      }
    };

    loadFilteredProcesses();
  }, [processes, filters, filterProcesses, processesResponsibles]);

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
