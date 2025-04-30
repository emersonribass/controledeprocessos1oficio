
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
    // MODIFICAÇÃO: Se o processo está concluído (no departamento Concluído(a)),
    // devemos considerar todos os departamentos anteriores como "passados"
    if (isLastDepartment) {
      // Se estivermos verificando o próprio departamento Concluído(a), retornar false
      if (departmentId === concludedDept?.id) return false;
      
      // Para todos os outros departamentos em processo concluído, retornar true
      return true;
    }
    
    // Comportamento original para processos não concluídos
    // Primeiro, encontrar o departamento atual na lista ordenada
    const currentDeptIndex = sortedDepartments.findIndex(d => d.id === process.currentDepartment);
    const targetDeptIndex = sortedDepartments.findIndex(d => d.id === departmentId);
    
    // Se o departamento alvo está depois do atual, não é um departamento passado
    if (targetDeptIndex > currentDeptIndex) return false;
    
    // Verificar se há uma entrada com data de saída para este departamento
    // E se essa foi a última entrada para este departamento
    const departmentEntries = process.history
      .filter((h: any) => h.departmentId === departmentId)
      .sort((a: any, b: any) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());
    
    // Se não há entradas ou a entrada mais recente não tem data de saída
    // e não é o departamento atual, então não passou por ele
    if (departmentEntries.length === 0) return false;
    
    const mostRecentEntry = departmentEntries[0];
    
    // Se é o departamento atual, não é considerado como "passado"
    if (departmentId === process.currentDepartment) return false;
    
    // Se tem data de saída na entrada mais recente, passou pelo departamento
    return !!mostRecentEntry.exitDate;
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
