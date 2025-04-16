
import { Department } from "@/types";

export const useProcessDepartmentInfo = (
  process: any, 
  departments: Department[]
) => {
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);

  // Obter o departamento "Concluído(a)" para referência
  const concludedDept = departments.find(dept => dept.name === "Concluído(a)");
  
  const isFirstDepartment = process.currentDepartment === sortedDepartments[0]?.id;
  const isLastDepartment = process.currentDepartment === concludedDept?.id;

  const getMostRecentEntryDate = (departmentId: string): string | null => {
    const departmentEntries = process.history
      .filter((h: any) => h.departmentId === departmentId)
      .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    
    return departmentEntries.length > 0 ? departmentEntries[0].entryDate : null;
  };

  const hasPassedDepartment = (departmentId: string): boolean => {
    return process.history.some((h: any) => h.departmentId === departmentId);
  };

  const isCurrentDepartment = (departmentId: string): boolean => {
    return process.currentDepartment === departmentId;
  };

  const isPreviousDepartment = (departmentId: string): boolean => {
    const deptOrder = departments.find(d => d.id === departmentId)?.order || 0;
    const currentDeptOrder = departments.find(d => d.id === process.currentDepartment)?.order || 0;
    return deptOrder < currentDeptOrder;
  };

  const isDepartmentOverdue = (departmentId: string, isProcessStarted: boolean): boolean => {
    if (departmentId !== process.currentDepartment || !isProcessStarted) return false;
    
    const dept = departments.find(d => d.id === departmentId);
    if (!dept || dept.timeLimit <= 0) return false;
    
    const entryDate = getMostRecentEntryDate(departmentId);
    if (!entryDate) return false;
    
    const entryDateTime = new Date(entryDate).getTime();
    const deadlineTime = entryDateTime + (dept.timeLimit * 24 * 60 * 60 * 1000);
    const currentTime = new Date().getTime();
    
    return currentTime > deadlineTime;
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
