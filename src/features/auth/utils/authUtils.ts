
// Tipos de responsáveis por processo
export enum ProcessResponsibleType {
  MAIN = 'main',
  SECTOR = 'sector',
  NONE = 'none'
}

/**
 * Utilitário para determinar o tipo de responsabilidade de um usuário em um processo
 * @param userId ID do usuário atual
 * @param processResponsibleId ID do responsável principal do processo
 * @param hasUserInSector Indica se existe um responsável no setor
 * @returns ProcessResponsibleType indicando o tipo de responsabilidade
 */
export const getProcessResponsibilityType = (
  userId: string | null | undefined,
  processResponsibleId: string | null | undefined,
  hasUserInSector: boolean
): ProcessResponsibleType => {
  if (!userId) return ProcessResponsibleType.NONE;
  
  if (processResponsibleId && userId === processResponsibleId) {
    return ProcessResponsibleType.MAIN;
  }
  
  if (hasUserInSector) {
    return ProcessResponsibleType.SECTOR;
  }
  
  return ProcessResponsibleType.NONE;
};
