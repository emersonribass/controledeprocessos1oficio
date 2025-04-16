
import { useEffect, useState, useMemo } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { useProcessListFilters } from "@/hooks/useProcessListFilters";
import { useProcessListSorting } from "@/hooks/useProcessListSorting";
import { useAuth } from "@/hooks/auth";
import { Process } from "@/types";
import ProcessListHeader from "./ProcessListHeader";
import ProcessListContent from "./ProcessListContent";
import { useResponsibleBatchLoader } from "@/hooks/process-responsibility/useResponsibleBatchLoader";

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
    isLoading,
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
  
  // Estado local para controlar se a página acabou de carregar
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Usar o novo hook para gerenciar carregamento de responsáveis
  const { 
    queueMultipleProcesses,
    responsiblesData,
    isLoading: isLoadingResponsibles
  } = useResponsibleBatchLoader();

  // Usando useMemo para evitar recálculos desnecessários dos processos filtrados
  const filteredProcesses = useMemo(() => {
    // Aplicar filtros apenas após o carregamento inicial
    if (!initialLoadComplete || isLoading) return [];
    
    // IMPORTANTE: Primeiro aplicar filtros, depois ordenar os resultados
    return sortProcesses(filterProcesses(filters, processes, responsiblesData));
  }, [filters, processes, sortProcesses, filterProcesses, initialLoadComplete, isLoading, responsiblesData]);

  // Determinar os departamentos disponíveis para o usuário atual
  const availableDepartments = useMemo(() => {
    if (isAdmin(user?.email || "") || !user?.departments?.length) {
      return departments;
    }
    return departments.filter(dept => user?.departments.includes(dept.id));
  }, [departments, user, isAdmin]);
  
  // Marcar o carregamento inicial como concluído após o primeiro render
  useEffect(() => {
    if (!isLoading && processes.length > 0 && !initialLoadComplete) {
      setInitialLoadComplete(true);
    }
  }, [isLoading, processes, initialLoadComplete]);
  
  // Efeito para enfileirar processos para carregamento de responsáveis
  useEffect(() => {
    if (processes.length > 0 && !isLoading) {
      const addedCount = queueMultipleProcesses(processes);
      if (addedCount > 0) {
        console.log(`Enfileirados ${addedCount} processos para carregamento de responsáveis`);
      }
    }
  }, [processes, isLoading, queueMultipleProcesses]);

  return (
    <div className="space-y-6">
      <ProcessListHeader
        title="Processos"
        description="Gerencie e acompanhe o andamento de todos os processos."
      />

      <ProcessListContent
        processes={processes}
        isLoading={isLoading || isLoadingResponsibles || !initialLoadComplete} 
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
        responsiblesData={responsiblesData}
      />
    </div>
  );
};

export default ProcessList;
