
import { createContext, useContext, ReactNode } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/features/departments/hooks/useDepartmentsData";
import { useProcessFilters } from "@/features/processes/hooks/useProcessFilters";
import { useProcessTypes } from "@/features/processes/hooks/useProcessTypes";
import { useSupabaseProcesses } from "@/features/processes/hooks/useSupabaseProcesses";

type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }, processesToFilter?: Process[]) => Process[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  isProcessOverdue: (process: Process) => boolean;
  departments: ReturnType<typeof useDepartmentsData>["departments"];
  processTypes: ReturnType<typeof useProcessTypes>["processTypes"];
  isLoading: boolean;
  refreshProcesses: () => Promise<void>;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess: (processId: string) => Promise<void>;
  // Novas funções para excluir processos
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
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
    moveProcessToPreviousDepartment,
    updateProcessType,
    updateProcessStatus,
    startProcess,
    deleteProcess,
    deleteManyProcesses
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
        refreshProcesses: fetchProcesses,
        updateProcessType,
        updateProcessStatus,
        startProcess,
        deleteProcess,
        deleteManyProcesses
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
