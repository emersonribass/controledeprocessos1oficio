
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import { Loader2 } from "lucide-react";

interface ProcessListProps {
  initialFilters?: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  };
}

const ProcessList = ({ initialFilters = {} }: ProcessListProps) => {
  const {
    filterProcesses,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    isLoading,
    processTypes,
    updateProcessType,
    updateProcessStatus,
    processes,
    departments,
    startProcess
  } = useProcesses();

  const [filters, setFilters] = useState<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }>(initialFilters);

  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Aplicar filtros iniciais
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  // Filtrar processos de acordo com os status
  const filteredProcesses = filterProcesses(filters, processes);

  // Sort processes
  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (sortField === "startDate" || sortField === "expectedEndDate") {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortField === "protocolNumber") {
      // Extrair números dos protocolos para ordenação numérica
      const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
      const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
      return sortDirection === "asc" ? numA - numB : numB - numA;
    }

    if (a[sortField] < b[sortField]) {
      return sortDirection === "asc" ? -1 : 1;
    }
    if (a[sortField] > b[sortField]) {
      return sortDirection === "asc" ? 1 : -1;
    }
    return 0;
  });

  const toggleSort = (field: keyof Process) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div>
      <ProcessFilters filters={filters} setFilters={setFilters} />

      {processes.length === 0 ? (
        <div className="flex justify-center items-center h-64 border rounded-md p-6 mt-4 bg-gray-50">
          <p className="text-muted-foreground text-lg">Nenhum processo encontrado</p>
        </div>
      ) : filteredProcesses.length === 0 ? (
        <div className="flex justify-center items-center h-64 border rounded-md p-6 mt-4 bg-gray-50">
          <p className="text-muted-foreground text-lg">Nenhum processo corresponde aos filtros selecionados</p>
        </div>
      ) : (
        <ProcessTable
          processes={sortedProcesses}
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
        />
      )}
    </div>
  );
};

export default ProcessList;
