
import { useState, useEffect } from "react";
import { useProcesses } from "../hooks/useProcesses";
import { Process, PROCESS_STATUS } from "@/types";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/features/auth";
import { useProcessResponsibles } from "../hooks/useProcessResponsibles";
import ProcessFilters from "@/components/Processes/ProcessFilters";
import ProcessTable from "./ProcessTable";
import { ProcessFilters as ProcessFiltersType } from "../types";

interface ProcessListProps {
  initialFilters?: ProcessFiltersType;
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
  
  const [userIsAdmin, setUserIsAdmin] = useState(false);
  
  const [filters, setFilters] = useState<ProcessFiltersType>({ 
    ...initialFilters, 
    showCompleted: false 
  });

  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters({ ...initialFilters, showCompleted: initialFilters.showCompleted ?? false });
    }
  }, [initialFilters]);
  
  // Usar o status admin já armazenado no objeto user
  useEffect(() => {
    if (user) {
      setUserIsAdmin(user.isAdmin || false);
    }
  }, [user]);

  // Filtragem rigorosa aplicando as regras de permissão de usuário
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

  // Usando o hook de responsáveis
  const responsiblesManager = useProcessResponsibles({ processes: sortedProcesses });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Filtrar os departamentos baseado nos departamentos do usuário
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
          responsiblesManager={responsiblesManager}
        />
      )}
    </div>
  );
};

export default ProcessList;
