
import { createContext, useContext, ReactNode, useState } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessOperations } from "@/hooks/process/useProcessOperations";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";
import { useAuth } from "@/hooks/auth";

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
  departments: ReturnType<typeof useDepartmentsData>["departments"];
  processTypes: ReturnType<typeof useProcessTypes>["processTypes"];
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
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { processes, isLoading, fetchProcesses } = useProcessesFetch();
  const { user } = useAuth();
  
  const { 
    filterProcesses, 
    isProcessOverdue,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible
  } = useProcessFiltering(processes);
  
  // Hook de operações de processos
  const { 
    moveProcessToNextDepartment: moveNext,
    moveProcessToPreviousDepartment: movePrevious,
    startProcess: startProcessBase,
    deleteProcess,
    deleteManyProcesses,
    updateProcessType: updateType,
    updateProcessStatus: updateStatus,
    getProcess
  } = useProcessOperations(() => fetchProcesses());

  // Adaptadores para converter Promise<boolean> para Promise<void>
  const moveProcessToNextDepartment = async (processId: string): Promise<void> => {
    await moveNext(processId);
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<void> => {
    await movePrevious(processId);
  };

  const startProcess = async (processId: string): Promise<void> => {
    await startProcessBase(processId);
  };

  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    await updateType(processId, newTypeId);
  };

  const updateProcessStatus = async (
    processId: string, 
    newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'
  ): Promise<void> => {
    await updateStatus(processId, newStatus);
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
