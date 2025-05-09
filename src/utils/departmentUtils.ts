
/**
 * Verifica se o setor atual é o setor de "Aguardando Documentação"
 * 
 * @param departmentId ID do setor a verificar
 * @returns true se for o setor "Aguardando Documentação" (ID = 2)
 */
export const isAwaitingDocsSection = (departmentId: string | number): boolean => {
  // O setor "Aguardando Documentação" tem ID 2 no sistema
  const awaitingDocsDepartmentId = 2;
  
  // Normalizar a comparação para aceitar string ou número
  let normalizedId: number;
  
  if (typeof departmentId === 'string') {
    // Remover espaços e tentar converter para número
    const cleanedId = departmentId.trim();
    normalizedId = isNaN(Number(cleanedId)) ? -1 : Number(cleanedId);
  } else if (typeof departmentId === 'number') {
    normalizedId = departmentId;
  } else {
    // Se não for string nem número, retorna false
    return false;
  }
  
  return normalizedId === awaitingDocsDepartmentId;
};
