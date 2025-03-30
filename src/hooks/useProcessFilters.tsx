
import { Process } from "@/types";

export const useProcessFilters = (processes: Process[]) => {
  const filterProcesses = (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }) => {
    return processes.filter((process) => {
      if (filters.department && process.currentDepartment !== filters.department) {
        return false;
      }

      if (filters.status && process.status !== filters.status) {
        return false;
      }

      if (filters.processType && process.processType !== filters.processType) {
        return false;
      }

      if (
        filters.search &&
        !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
      ) {
        return false;
      }

      return true;
    });
  };

  const isProcessOverdue = (process: Process) => {
    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};
