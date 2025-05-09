
import { createContext, useContext, ReactNode, useState } from "react";
import { Process } from "@/types";
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessHookAdapters } from "./process/context/useProcessHookAdapters";
import { useProcessBaseOperations } from "./process/context/useProcessBaseOperations";
import { useProcessResponsibilityIntegration } from "./process/context/useProcessResponsibilityIntegration";
import { useProcessDependencies } from "./process/context/useProcessDependencies";
import { useProcessTableState } from "./useProcessTableState";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcesses");

// Definição do tipo para o contexto
type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
    startDate?: string;
    endDate?: string;
    responsibleUser?: string;
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
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') => Promise<void>;
  startProcess: (processId: string) => Promise<void>;
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
  getProcess: (processId: string) => Promise<Process | null>;
  isUserResponsibleForProcess: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector: (process: Process, userId: string) => boolean;
  isUserInAttendanceSector: () => boolean;
  isUserInCurrentSector: (process: Process) => boolean;
  hasSectorResponsible: (processId: string, sectorId: string) => Promise<boolean>;
  queueSectorForLoading: (processId: string, sectorId: string) => void;
};

// Criação do contexto
const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

/**
 * Provider para o contexto de processos
 */
export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  logger.info("Inicializando ProcessesProvider");
  const { processes, isLoading: isLoadingProcesses, fetchProcesses } = useProcessesFetch();
  const { queueSectorForLoading } = useProcessTableState(processes);
  
  logger.debug(`ProcessesProvider carregou ${processes.length} processos`);
  
  // Hooks para diferentes partes do contexto
  const { departments, processTypes, getDepartmentName, getProcessTypeName } = useProcessDependencies();
  
  logger.debug(`ProcessesProvider carregou ${departments?.length || 0} departamentos e ${processTypes?.length || 0} tipos de processo`);
  
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
  
  logger.debug("ProcessesProvider inicializado com sucesso");
  
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
        isLoading: isLoadingProcesses,
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
        hasSectorResponsible,
        queueSectorForLoading
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
    logger.error("useProcesses deve ser usado dentro de um ProcessesProvider");
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  logger.debug("useProcesses acessado com sucesso");
  return context;
};
