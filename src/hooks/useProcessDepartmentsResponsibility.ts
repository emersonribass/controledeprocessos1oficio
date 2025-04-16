
import { useCallback } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { Department } from "@/types";
import { useProcessBatchLoader } from "./useProcessBatchLoader";

/**
 * Hook para gerenciar responsáveis por departamentos em um processo
 * Implementa carregamento eficiente com cache centralizado
 */
export const useProcessDepartmentsResponsibility = (
  processId: string,
  departments: Department[],
  isCurrentDepartment: (deptId: string) => boolean,
  hasPassedDepartment: (deptId: string) => boolean
) => {
  const {
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading
  } = useProcessBatchLoader();
  
  // Carregar o responsável do processo
  const processResponsible = getProcessResponsible(processId);
  
  // Para cada departamento relevante, verifica se precisamos carregar o responsável
  const departmentResponsibles: Record<string, ProcessResponsible | null> = {};
  
  // Apenas percorre os departamentos para popular o objeto de responsáveis
  departments.forEach(dept => {
    if (isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)) {
      // Coloca na fila para carregamento se necessário
      queueSectorForLoading(processId, dept.id);
      
      // Obtém o valor atual (pode ser undefined se ainda não carregado)
      const responsible = getSectorResponsible(processId, dept.id);
      
      // Só adiciona ao objeto se já tiver o valor (não undefined)
      if (responsible !== undefined) {
        departmentResponsibles[dept.id] = responsible;
      }
    }
  });
  
  // Função para forçar uma atualização
  const refreshResponsibles = useCallback(() => {
    if (!processId) return;
    
    queueProcessForLoading(processId);
    
    departments.forEach(dept => {
      if (isCurrentDepartment(dept.id) || hasPassedDepartment(dept.id)) {
        queueSectorForLoading(processId, dept.id);
      }
    });
  }, [processId, departments, isCurrentDepartment, hasPassedDepartment, queueProcessForLoading, queueSectorForLoading]);
  
  return {
    processResponsible,
    departmentResponsibles,
    refreshResponsibles
  };
};
