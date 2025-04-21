
/**
 * Verifica se o setor atual é o setor de "Aguardando Documentação"
 * 
 * @param departmentId ID do setor a verificar
 * @returns true se for o setor "Aguardando Documentação" (ID = 2)
 */
export const isAwaitingDocsSection = (departmentId: string | number): boolean => {
  // O setor "Aguardando Documentação" tem ID 2 no sistema
  const awaitingDocsDepartmentId = 2;
  
  if (typeof departmentId === 'string') {
    return departmentId === String(awaitingDocsDepartmentId);
  }
  
  return departmentId === awaitingDocsDepartmentId;
};
