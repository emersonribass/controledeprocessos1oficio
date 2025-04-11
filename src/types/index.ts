export interface Department {
  id: string;
  name: string;
  order: number;
  timeLimit: number;
}

export interface ProcessType {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
}

export interface HistoryEntry {
  id?: string;
  processId: string;
  departmentId: string;
  userId: string;
  userName: string;
  entryDate: string;
  exitDate?: string;
  comments?: string;
  usuario_responsavel_setor?: string | null;
}

// Constants for process status
export const PROCESS_STATUS = {
  NOT_STARTED: "Não iniciado",
  PENDING: "Em andamento",
  COMPLETED: "Concluído",
  OVERDUE: "Atrasado"
} as const;

export type ProcessStatus = typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS];

export interface Process {
  id: string;
  protocolNumber: string;
  processType: string;
  currentDepartment: string;
  startDate: string;
  expectedEndDate: string;
  status: ProcessStatus;
  description?: string;
  history: HistoryEntry[];
  attachments?: string[];
  responsibleUser?: string | null;
  userId?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  departments: string[];
  isAdmin: boolean;
}

export interface Notification {
  id: string;
  userId: string;
  processId: string;
  message: string;
  read: boolean;
  createdAt: string;
  respondida?: boolean;
}
