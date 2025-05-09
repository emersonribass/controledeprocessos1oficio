
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessTypes } from "@/hooks/useProcessTypes";

/**
 * Hook para gerenciar as dependências do contexto de processos
 * como departamentos e tipos de processo
 */
export const useProcessDependencies = () => {
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  
  return {
    departments,
    processTypes,
    getDepartmentName,
    getProcessTypeName
  };
};
