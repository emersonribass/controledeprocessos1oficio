
import { Process, ProcessType, Department } from "@/types";
import { ProcessResponsiblesHookResult } from "./hooks/useProcessResponsibles";

export interface ProcessesContextType {
  processes: Process[];
  filterProcesses: (filters: ProcessFilters, processesToFilter?: Process[]) => Process[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  isProcessOverdue: (process: Process) => boolean;
  departments: Department[];
  processTypes: ProcessType[];
  isLoading: boolean;
  refreshProcesses: () => Promise<void>;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess: (processId: string) => Promise<void>;
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
}

export interface ProcessFilters {
  department?: string;
  status?: string;
  processType?: string;
  search?: string;
  showCompleted?: boolean;
}
