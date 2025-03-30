
import { createContext, useContext, useState, ReactNode } from "react";
import { Process } from "@/types";
import { mockProcesses } from "@/lib/mockData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessOperations } from "@/hooks/useProcessOperations";
import { useProcessFilters } from "@/hooks/useProcessFilters";
import { useProcessTypes } from "@/hooks/useProcessTypes";

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
};

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [processes, setProcesses] = useState<Process[]>(mockProcesses);
  
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { moveProcessToNextDepartment, moveProcessToPreviousDepartment } = useProcessOperations(processes, setProcesses, departments);
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
