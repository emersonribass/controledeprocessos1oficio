
import { useState, useEffect } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process, PROCESS_STATUS } from "@/types";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";

interface ProcessListProps {
  initialFilters?: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    showCompleted?: boolean;
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

  const { user } = useAuth();
  
  // Estado para armazenar o status admin do usuário atual
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  
  const [filters, setFilters] = useState<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    showCompleted?: boolean;
  }>({ ...initialFilters, showCompleted: false });

  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters({ ...initialFilters, showCompleted: initialFilters.showCompleted ?? false });
    }
  }, [initialFilters]);
  
  // Verificar os departamentos do usuário no carregamento do componente
  useEffect(() => {
    // Aqui utilizamos o status admin já cacheado
    if (user && user.isAdmin !== undefined) {
      setUserIsAdmin(user.isAdmin);
    }
  }, [user]);

  const filteredProcesses = filterProcesses(filters, processes);

  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    // Primeiro, ordenar por status: processos iniciados (não 'Não iniciado') vêm primeiro
    if (a.status === PROCESS_STATUS.NOT_STARTED && b.status !== PROCESS_STATUS.NOT_STARTED) {
      return 1; // a (não iniciado) vem depois
    }
    if (a.status !== PROCESS_STATUS.NOT_STARTED && b.status === PROCESS_STATUS.NOT_STARTED) {
      return -1; // a (iniciado) vem antes
    }
    
    // Se ambos têm o mesmo status de iniciação, usar a ordenação por campo selecionado
    if (sortField === "startDate" || sortField === "expectedEndDate") {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
    }

    if (sortField === "protocolNumber") {
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

  const availableDepartments = userIsAdmin || !user?.departments?.length 
    ? departments 
    : departments.filter(dept => user?.departments.includes(dept.id));

  return (
    <div>
      <ProcessFilters 
        filters={filters} 
        setFilters={setFilters} 
        availableDepartments={availableDepartments}
      />

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
