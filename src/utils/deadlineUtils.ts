
import { Department, Process } from "@/types";

/**
 * Verifica se um departamento está com prazo expirado para um processo
 * @param process Processo a ser analisado
 * @param departmentId ID do departamento
 * @param entryDate Data de entrada no departamento
 * @param departments Lista completa de departamentos
 * @returns true se o prazo estiver expirado, false caso contrário
 */
export const isDepartmentOverdue = (
  process: Process,
  departmentId: string,
  entryDate: string | null,
  departments: Department[]
): boolean => {
  // Se não for o departamento atual ou o processo não estiver iniciado, não está em atraso
  if (departmentId !== process.currentDepartment || process.status === 'not_started') {
    return false;
  }
  
  // Encontrar o departamento para obter o limite de tempo
  const dept = departments.find(d => d.id === departmentId);
  if (!dept || dept.timeLimit <= 0 || !entryDate) {
    return false;
  }
  
  // Calcular se o prazo expirou
  const entryDateTime = new Date(entryDate).getTime();
  const deadlineTime = entryDateTime + (dept.timeLimit * 24 * 60 * 60 * 1000);
  const currentTime = new Date().getTime();
  
  return currentTime > deadlineTime;
};

/**
 * Calcula os dias restantes para um prazo de departamento
 * @param entryDate Data de entrada no departamento
 * @param timeLimit Limite de tempo em dias
 * @returns Número de dias restantes (pode ser negativo se estiver em atraso)
 */
export const calculateRemainingDays = (entryDate: string | null, timeLimit: number): number => {
  if (!entryDate || timeLimit <= 0) return 0;
  
  const entryDateTime = new Date(entryDate).getTime();
  const deadlineTime = entryDateTime + timeLimit * 24 * 60 * 60 * 1000;
  const currentTime = new Date().getTime();
  
  return Math.ceil((deadlineTime - currentTime) / (24 * 60 * 60 * 1000));
};

/**
 * Verifica se um processo está com prazo geral expirado
 * @param process Processo a ser analisado
 * @returns true se o prazo geral estiver expirado, false caso contrário
 */
export const isProcessOverdue = (process: Process): boolean => {
  if (process.status === 'overdue') return true;
  
  const now = new Date();
  const expectedEndDate = new Date(process.expectedEndDate);
  return now > expectedEndDate;
};

/**
 * Calcula os dias de atraso de um processo
 * @param process Processo a ser analisado
 * @returns Número de dias em atraso (0 se não estiver em atraso)
 */
export const calculateOverdueDays = (process: Process): number => {
  if (!isProcessOverdue(process)) return 0;
  
  const now = new Date().getTime();
  const expectedEndDate = new Date(process.expectedEndDate).getTime();
  return Math.ceil((now - expectedEndDate) / (24 * 60 * 60 * 1000));
};
