
import { Department } from "@/types";

export const useProcessTableUtilities = (departments: Department[]) => {
  // Ordenar departamentos por ordem e filtrar o departamento "Concluído(a)"
  const sortedDepartments = [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);
    
  // Obter o departamento "Concluído(a)" para referência
  const concludedDept = departments.find(dept => dept.name === "Concluído(a)");

  return {
    sortedDepartments,
    concludedDept
  };
};
