
import { Department, Process, ProcessType, User, PROCESS_STATUS } from "@/types";

export const mockUsers: User[] = [
  {
    id: "1",
    email: "admin@nottar.com",
    name: "Admin",
    departments: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"],
    isAdmin: true
  },
  {
    id: "2",
    email: "joao@nottar.com",
    name: "João Silva",
    departments: ["1", "2"],
    isAdmin: false
  },
  {
    id: "3",
    email: "maria@nottar.com",
    name: "Maria Oliveira",
    departments: ["3", "4"],
    isAdmin: false
  },
];

export const mockDepartments: Department[] = [
  { id: "1", name: "Atendimento", order: 1, timeLimit: 3 },
  { id: "2", name: "Digitação 1", order: 2, timeLimit: 2 },
  { id: "3", name: "Conferência 1", order: 3, timeLimit: 1 },
  { id: "4", name: "Digitação 2", order: 4, timeLimit: 2 },
  { id: "5", name: "Conferência 2", order: 5, timeLimit: 1 },
  { id: "6", name: "Lavratura", order: 6, timeLimit: 3 },
  { id: "7", name: "Assinatura", order: 7, timeLimit: 1 },
  { id: "8", name: "Registro", order: 8, timeLimit: 5 },
  { id: "9", name: "Retorno de Registro", order: 9, timeLimit: 2 },
  { id: "10", name: "Concluído(a)", order: 10, timeLimit: 0 },
];

export const mockProcessTypes: ProcessType[] = [
  { id: "1", name: "Escritura", active: true },
  { id: "2", name: "Procuração", active: true },
  { id: "3", name: "Testamento", active: true },
  { id: "4", name: "Ata Notarial", active: true },
  { id: "5", name: "Reconhecimento de Firma", active: true },
  { id: "6", name: "Autenticação", active: true },
];

// Generate a random date between start and end dates
const randomDate = (start: Date, end: Date) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Create 20 mock processes with random data
export const mockProcesses: Process[] = Array.from({ length: 20 }).map((_, index) => {
  const startDate = randomDate(new Date(2023, 0, 1), new Date());
  const departmentId = String(Math.floor(Math.random() * 10) + 1);
  
  // Set some processes as overdue
  const isOverdue = Math.random() > 0.7;
  const isCompleted = departmentId === "10";
  
  let status: typeof PROCESS_STATUS[keyof typeof PROCESS_STATUS];
  
  if (isCompleted) {
    status = PROCESS_STATUS.COMPLETED;
  } else if (isOverdue) {
    status = PROCESS_STATUS.OVERDUE;
  } else {
    status = PROCESS_STATUS.PENDING;
  }
  
  return {
    id: String(index + 1),
    protocolNumber: `PROC-${(10000 + index).toString()}`,
    processType: String(Math.floor(Math.random() * 6) + 1),
    currentDepartment: departmentId,
    startDate: startDate.toISOString(),
    expectedEndDate: new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 15).toISOString(), // 15 days after start
    status,
    history: [
      {
        processId: String(index + 1),
        departmentId: "1",
        entryDate: startDate.toISOString(),
        exitDate: new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 2).toISOString(),
        userId: String(Math.floor(Math.random() * 3) + 1),
        userName: `Usuário ${Math.floor(Math.random() * 3) + 1}`
      },
      ...(parseInt(departmentId) > 1 ? [{
        processId: String(index + 1),
        departmentId: departmentId,
        entryDate: new Date(startDate.getTime() + 1000 * 60 * 60 * 24 * 3).toISOString(),
        exitDate: null,
        userId: String(Math.floor(Math.random() * 3) + 1),
        userName: `Usuário ${Math.floor(Math.random() * 3) + 1}`
      }] : []),
    ],
  };
});

export const mockNotifications = [
  {
    id: "1",
    userId: "1",
    processId: "1",
    message: "Processo PROC-10001 foi movido para Digitação 1",
    read: false,
    createdAt: new Date().toISOString(),
  },
  {
    id: "2",
    userId: "1",
    processId: "2",
    message: "Processo PROC-10002 está próximo do prazo limite",
    read: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
  },
  {
    id: "3",
    userId: "2",
    processId: "3",
    message: "Processo PROC-10003 foi atribuído a você",
    read: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
];
