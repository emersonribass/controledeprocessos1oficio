
export type User = {
  id: string;
  email: string;
  name: string;
  departments: string[];
  createdAt: string;
};

export type Department = {
  id: string;
  name: string;
  order: number;
  timeLimit: number; // in days
};

export type ProcessType = {
  id: string;
  name: string;
  active?: boolean; // Adicionando propriedade 'active'
  description?: string; // Adicionando propriedade opcional 'description'
};

export type Process = {
  id: string;
  protocolNumber: string;
  processType: string;
  currentDepartment: string;
  startDate: string;
  expectedEndDate: string;
  status: 'pending' | 'completed' | 'overdue' | 'not_started';
  history: ProcessHistory[];
  userId?: string; // Adicionando o ID do usuário responsável
  responsibleUserId?: string; // Adicionando o ID do usuário que aceitou o processo
};

export type ProcessHistory = {
  departmentId: string;
  entryDate: string;
  exitDate: string | null;
  userId: string;
};

export type Notification = {
  id: string;
  userId: string;
  processId: string;
  message: string;
  read: boolean;
  createdAt: string;
  type?: string;
  responded?: boolean;
};
