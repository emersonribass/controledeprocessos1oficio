
import { createContext, useContext, ReactNode } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/features/departments/hooks/useDepartmentsData";
import { useProcessFilters } from "../hooks/useProcessFilters";
import { useProcessTypes } from "../hooks/useProcessTypes";
import { useSupabaseProcesses } from "../hooks/useSupabaseProcesses";
import { ProcessesContextType } from "../types";

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
