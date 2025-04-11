export interface Department {
  id: string;
  name: string;
  order: number;
  timeLimit: number;
}

export interface ProcessType {
  id: string;
  name: string;
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
}

export interface Process {
  id: string;
  protocolNumber: string;
  processType: string;
  currentDepartment: string;
  startDate: string;
  expectedEndDate: string;
  status: 'Não iniciado' | 'Em andamento' | 'Concluído' | 'Atrasado';
  description?: string;
  history: HistoryEntry[];
  attachments?: string[];
  responsibleUser?: string | null;
}

export interface User {
  id: string;
  name: string;
  email: string;
  departments: string[];
  isAdmin: boolean;
}
