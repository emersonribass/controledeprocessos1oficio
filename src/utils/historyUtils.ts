
/**
 * Este arquivo agora utiliza os métodos do ProcessHistoryService
 * para manter compatibilidade com o código existente
 */
import { ProcessHistoryService, HistoryEntry } from './processHistoryService';

/**
 * Extrai o ID do histórico usando várias estratégias
 */
export const extractHistoryId = (historyEntry: any): number | undefined => {
  return ProcessHistoryService.extractHistoryId(historyEntry);
};

/**
 * Encontra a entrada mais recente do histórico para um determinado setor
 */
export const findLatestHistoryEntry = (
  history: any[],
  currentDepartment: string | number
): any | undefined => {
  return ProcessHistoryService.findLatestHistoryEntry(history, currentDepartment);
};
