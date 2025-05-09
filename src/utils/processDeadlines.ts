
import { isBusinessDeadlineExceeded } from "./dateUtils";

interface HistoryEntry {
  departmentId: string;
  entryDate: string;
  exitDate: string | null;
  data_entrada?: string; // Campo opcional para compatibilidade
  data_saida?: string | null; // Campo opcional para compatibilidade
  setor_id?: string; // Campo opcional para compatibilidade
  setorId?: string; // Campo opcional para compatibilidade
}

export function isDepartmentOverdue({
  history,
  currentDepartment,
  departmentTimeLimit,
}: {
  history: Array<HistoryEntry>;
  currentDepartment: string;
  departmentTimeLimit: number | null | undefined;
}): boolean {
  if (!departmentTimeLimit || !history?.length) return false;

  // Busca a entrada mais recente (sem saída) para o setor atual
  const currentEntry = history
    .filter((h: HistoryEntry) => {
      const departmentMatch = 
        h.departmentId === currentDepartment || 
        h.setor_id === currentDepartment || 
        h.setorId === currentDepartment;
      
      const noExit = 
        h.exitDate === null || 
        h.data_saida === null;
      
      return departmentMatch && noExit;
    })
    .sort((a: HistoryEntry, b: HistoryEntry) => {
      const dateA = new Date(a.entryDate || a.data_entrada || "").getTime();
      const dateB = new Date(b.entryDate || b.data_entrada || "").getTime();
      return dateB - dateA;
    })[0];

  if (!currentEntry) return false;

  const entrada = new Date(currentEntry.entryDate || currentEntry.data_entrada || "");
  
  // Verifica se o prazo em dias úteis foi excedido
  return isBusinessDeadlineExceeded(entrada, departmentTimeLimit);
}
