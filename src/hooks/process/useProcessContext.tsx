
import { createContext, useContext, ReactNode, useState } from "react";
import { Process } from "@/types";
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessHookAdapters } from "./context/useProcessHookAdapters";
import { useProcessBaseOperations } from "./context/useProcessBaseOperations";
import { useProcessResponsibilityIntegration } from "./context/useProcessResponsibilityIntegration";
import { useProcessDependencies } from "./context/useProcessDependencies";

// Definição do tipo para o contexto
type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
  }, processesToFilter?: Process[], processesResponsibles?: Record<string, any>) => Promise<Process[]>;
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  isProcessOverdue: (process: Process) => boolean;
  departments: any[];
  processTypes: any[];
  isLoading: boolean;
  refreshProcesses: () => Promise<void>;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess: (processId: string) => Promise<void>;
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
  getProcess: (processId: string) => Promise<Process | null>;
  isUserResponsibleForProcess: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector: (process: Process, userId: string) => boolean;
  isUserInAttendanceSector: () => boolean;
  isUserInCurrentSector: (process: Process) => boolean;
  hasSectorResponsible: (processId: string, sectorId: string) => Promise<boolean>;
};

// Criação do contexto
const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

/**
 * Provider para o contexto de processos
 */
export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const { processes, isLoading, fetchProcesses } = useProcessesFetch();
  
  // Hooks para diferentes partes do contexto
  const { departments, processTypes, getDepartmentName, getProcessTypeName } = useProcessDependencies();
  
  const { 
    filterProcesses, 
    isProcessOverdue,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible
  } = useProcessResponsibilityIntegration(processes);
  
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment,
    startProcess,
    updateProcessType,
    updateProcessStatus,
    deleteProcess,
    deleteManyProcesses,
    getProcess
  } = useProcessBaseOperations(fetchProcesses);
  
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
        deleteManyProcesses,
        getProcess,
        isUserResponsibleForProcess,
        isUserResponsibleForSector,
        isUserInAttendanceSector,
        isUserInCurrentSector,
        hasSectorResponsible
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de processos
 */
export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (context === undefined) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};
