
import { Process, ProcessType, Department, ProcessStatus } from "@/types";

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
  updateProcessStatus: (processId: string, newStatus: ProcessStatus) => Promise<void>;
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

export enum ProcessResponsibilityType {
  MAIN = 'main',
  SECTOR = 'sector',
  NONE = 'none'
}

export interface ProcessResponsiblesHookResult {
  hasProcessResponsible: (processId: string) => boolean;
  isUserProcessResponsible: (processId: string) => boolean;
  processResponsibles: Record<string, string | null>;
  setProcessResponsibles: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}
