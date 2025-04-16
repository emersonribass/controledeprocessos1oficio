
import { Process } from "@/types";

/**
 * Obtém a data de entrada mais recente para um departamento específico
 * @param process Processo a ser analisado
 * @param departmentId ID do departamento
 * @returns Data de entrada mais recente ou null se não houver entrada
 */
export const getMostRecentEntryDate = (process: Process, departmentId: string): string | null => {
  const departmentEntries = process.history
    .filter(h => h.departmentId === departmentId)
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
  
  return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
};

/**
 * Verifica se um processo já passou por um departamento específico
 * @param process Processo a ser analisado
 * @param departmentId ID do departamento
 * @returns true se o processo já passou pelo departamento, false caso contrário
 */
export const hasPassedDepartment = (process: Process, departmentId: string): boolean => {
  return process.history.some(h => h.departmentId === departmentId);
};

/**
 * Verifica se um departamento é o departamento atual do processo
 * @param process Processo a ser analisado
 * @param departmentId ID do departamento
 * @returns true se for o departamento atual, false caso contrário
 */
export const isCurrentDepartment = (process: Process, departmentId: string): boolean => {
  return process.currentDepartment === departmentId;
};

/**
 * Verifica se um departamento é anterior ao departamento atual no fluxo do processo
 * @param process Processo a ser analisado
 * @param departmentId ID do departamento a verificar
 * @param departments Lista completa de departamentos
 * @returns true se for um departamento anterior, false caso contrário
 */
export const isPreviousDepartment = (process: Process, departmentId: string, departments: any[]): boolean => {
  const deptOrder = departments.find(d => d.id === departmentId)?.order || 0;
  const currentDeptOrder = departments.find(d => d.id === process.currentDepartment)?.order || 0;
  return deptOrder < currentDeptOrder;
};
