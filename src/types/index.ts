
import { Tables } from "@/integrations/supabase/schema";

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
  active?: boolean;
  description?: string;
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
  userId?: string;
  responsibleUserId?: string;
};

export type ProcessHistory = {
  departmentId: string;
  entryDate: string;
  exitDate: string | null;
  userId: string;
};

// Utiliza o tipo de notificação do Supabase com adaptações
export type Notification = Omit<Tables["notificacoes"], "mensagem"> & {
  message: string;
};

// Mapear os tipos do banco de dados para os tipos da aplicação
export const mapSupabaseUserToUser = (dbUser: Tables["usuarios"]): User => {
  return {
    id: dbUser.id,
    email: dbUser.email,
    name: dbUser.nome,
    departments: dbUser.setores_atribuidos || [],
    createdAt: dbUser.created_at || new Date().toISOString()
  };
};

export const mapSupabaseDepartmentToDepartment = (dbDepartment: Tables["setores"]): Department => {
  return {
    id: dbDepartment.id.toString(),
    name: dbDepartment.name,
    order: dbDepartment.order_num,
    timeLimit: dbDepartment.time_limit
  };
};

export const mapSupabaseNotificationToNotification = (dbNotification: Tables["notificacoes"]): Notification => {
  return {
    ...dbNotification,
    message: dbNotification.mensagem
  };
};
