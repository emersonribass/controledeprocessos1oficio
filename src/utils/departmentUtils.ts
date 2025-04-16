
import { Department } from "@/types";

/**
 * Retorna uma lista ordenada de departamentos, excluindo o departamento "Concluído(a)"
 * @param departments Lista completa de departamentos
 * @returns Lista ordenada de departamentos sem o "Concluído(a)"
 */
export const getSortedActiveDepartments = (departments: Department[]): Department[] => {
  return [...departments]
    .filter(dept => dept.name !== "Concluído(a)")
    .sort((a, b) => a.order - b.order);
};

/**
 * Encontra o departamento "Concluído(a)" em uma lista de departamentos
 * @param departments Lista completa de departamentos
 * @returns O departamento "Concluído(a)" ou undefined se não encontrado
 */
export const getConcludedDepartment = (departments: Department[]): Department | undefined => {
  return departments.find(dept => dept.name === "Concluído(a)");
};

/**
 * Verifica se um departamento é o primeiro na ordem
 * @param departmentId ID do departamento a verificar
 * @param departments Lista completa de departamentos
 * @returns true se for o primeiro departamento, false caso contrário
 */
export const isFirstDepartment = (departmentId: string, departments: Department[]): boolean => {
  const sortedDepts = getSortedActiveDepartments(departments);
  return sortedDepts.length > 0 && sortedDepts[0].id === departmentId;
};

/**
 * Verifica se um departamento é o último (Concluído) na ordem
 * @param departmentId ID do departamento a verificar
 * @param departments Lista completa de departamentos
 * @returns true se for o departamento "Concluído(a)", false caso contrário
 */
export const isLastDepartment = (departmentId: string, departments: Department[]): boolean => {
  const concludedDept = getConcludedDepartment(departments);
  return !!concludedDept && concludedDept.id === departmentId;
};
