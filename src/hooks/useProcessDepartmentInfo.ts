
import { Department, Process } from "@/types";
import { 
  getSortedActiveDepartments, 
  getConcludedDepartment,
  isFirstDepartment as isFirstDept,
  isLastDepartment as isLastDept
} from "@/utils/departmentUtils";
import { 
  getMostRecentEntryDate as getEntryDate,
  hasPassedDepartment as hasPassed,
  isCurrentDepartment as isCurrent,
  isPreviousDepartment as isPrevious
} from "@/utils/processHistoryUtils";
import { isDepartmentOverdue as isDeptOverdue } from "@/utils/deadlineUtils";

/**
 * Hook para extrair e calcular informações de departamentos de um processo
 */
export const useProcessDepartmentInfo = (
  process: Process, 
  departments: Department[]
) => {
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = getSortedActiveDepartments(departments);

  // Obter o departamento "Concluído(a)" para referência
  const concludedDept = getConcludedDepartment(departments);
  
  // Verificar se o processo está no primeiro ou último departamento
  const isFirstDepartment = isFirstDept(process.currentDepartment, departments);
  const isLastDepartment = isLastDept(process.currentDepartment, departments);

  // Função wrapper para obter a data de entrada mais recente
  const getMostRecentEntryDate = (departmentId: string): string | null => {
    return getEntryDate(process, departmentId);
  };

  // Função wrapper para verificar se o processo passou por um departamento
  const hasPassedDepartment = (departmentId: string): boolean => {
    return hasPassed(process, departmentId);
  };

  // Função wrapper para verificar se é o departamento atual
  const isCurrentDepartment = (departmentId: string): boolean => {
    return isCurrent(process, departmentId);
  };

  // Função wrapper para verificar se é um departamento anterior
  const isPreviousDepartment = (departmentId: string): boolean => {
    return isPrevious(process, departmentId, departments);
  };

  // Função wrapper para verificar se um departamento está com prazo expirado
  const isDepartmentOverdue = (departmentId: string, isProcessStarted: boolean): boolean => {
    if (!isProcessStarted) return false;
    const entryDate = getMostRecentEntryDate(departmentId);
    return isDeptOverdue(process, departmentId, entryDate, departments);
  };

  return {
    sortedDepartments,
    concludedDept,
    isFirstDepartment,
    isLastDepartment,
    getMostRecentEntryDate,
    hasPassedDepartment,
    isCurrentDepartment,
    isPreviousDepartment,
    isDepartmentOverdue
  };
};
