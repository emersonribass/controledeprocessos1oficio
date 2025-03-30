
import { createContext, useContext, useState, ReactNode } from "react";
import { Process, Department } from "@/types";
import { mockProcesses, mockProcessTypes } from "@/lib/mockData";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessOperations } from "@/hooks/useProcessOperations";
import { useProcessFilters } from "@/hooks/useProcessFilters";

type ProcessesContextType = {
  processes: Process[];
  departments: Department[];
  processTypes: typeof mockProcessTypes;
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
};

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const [processes, setProcesses] = useState<Process[]>(mockProcesses);
  const [processTypes] = useState(mockProcessTypes);
  
  const { departments, getDepartmentName } = useDepartmentsData();
  const { moveProcessToNextDepartment, moveProcessToPreviousDepartment } = useProcessOperations(processes, setProcesses, departments);
  const { filterProcesses, isProcessOverdue } = useProcessFilters(processes);

  const getProcessTypeName = (id: string) => {
    const processType = processTypes.find((pt) => pt.id === id);
    return processType ? processType.name : "Desconhecido";
  };

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
