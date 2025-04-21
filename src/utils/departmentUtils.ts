
/**
 * Verifica se o setor atual é o setor de "Aguardando Documentação"
 */
export const isAwaitingDocsSection = (departmentId: string | number): boolean => {
  return departmentId === "2" || departmentId === 2;
};

