
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
};
