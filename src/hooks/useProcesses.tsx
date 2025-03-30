
import { createContext, useContext, ReactNode } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessFilters } from "@/hooks/useProcessFilters";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useSupabaseProcesses } from "@/hooks/useSupabaseProcesses";

type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }) => Process[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  isProcessOverdue: (process: Process) => boolean;
  departments: ReturnType<typeof useDepartmentsData>["departments"];
  processTypes: ReturnType<typeof useProcessTypes>["processTypes"];
  isLoading: boolean;
  refreshProcesses: () => Promise<void>;
};

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { 
    processes, 
    isLoading, 
    fetchProcesses, 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment 
  } = useSupabaseProcesses();
  const { filterProcesses, isProcessOverdue } = useProcessFilters(processes);

  return (
    <ProcessesContext.Provider
      value={{
        processes,
        departments,
        processTypes,
        filterProcesses,
        getDepartmentName,
        getProcessTypeName,
        moveProcessToNextDepartment,
        moveProcessToPreviousDepartment,
        isProcessOverdue,
        isLoading,
        refreshProcesses: fetchProcesses
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
};

export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (context === undefined) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};
