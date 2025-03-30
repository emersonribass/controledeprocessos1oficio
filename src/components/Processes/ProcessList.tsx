
import { useState } from "react";
import { useProcesses } from "@/hooks/useProcesses";
import { Process } from "@/types";
import ProcessFilters from "./ProcessFilters";
import ProcessTable from "./ProcessTable";
import { Loader2 } from "lucide-react";

const ProcessList = () => {
  const {
    filterProcesses,
    getDepartmentName,
    getProcessTypeName,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    isLoading
  } = useProcesses();

  const [filters, setFilters] = useState<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }>({});

  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const filteredProcesses = filterProcesses(filters);

  // Sort processes
  const sortedProcesses = [...filteredProcesses].sort((a, b) => {
    if (sortField === "startDate" || sortField === "expectedEndDate") {
      const dateA = new Date(a[sortField]).getTime();
      const dateB = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
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

      <ProcessTable
        processes={sortedProcesses}
        sortField={sortField}
        sortDirection={sortDirection}
        toggleSort={toggleSort}
        getDepartmentName={getDepartmentName}
        getProcessTypeName={getProcessTypeName}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
      />
    </div>
  );
};

export default ProcessList;
