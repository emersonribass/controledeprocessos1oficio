
import { Process } from "@/types";

/**
 * Verifica se um usuário é responsável direto por um processo
 * @param process Processo a ser analisado
 * @param userId ID do usuário
 * @returns true se o usuário for responsável pelo processo, false caso contrário
 */
export const isUserResponsibleForProcess = (process: Process, userId: string): boolean => {
  return process.userId === userId || process.responsibleUserId === userId;
};

/**
 * Verifica se um usuário está no setor de atendimento
 * @param userDepartments Setores atribuídos ao usuário
 * @returns true se o usuário estiver no setor de atendimento, false caso contrário
 */
export const isUserInAttendanceSector = (userDepartments: string[] | undefined): boolean => {
  return userDepartments?.includes("1") || false;
};

/**
 * Verifica se um processo tem responsável em um setor específico
 * @param responsiblesMap Mapa de responsáveis por processo e setor
 * @param processId ID do processo
 * @param sectorId ID do setor
 * @returns true se o processo tiver responsável no setor, false caso contrário
 */
export const hasResponsibleInSector = (
  responsiblesMap: Record<string, Record<string, any>>,
  processId: string,
  sectorId: string
): boolean => {
  return !!(
    responsiblesMap[processId] && 
    responsiblesMap[processId][sectorId]
  );
};
