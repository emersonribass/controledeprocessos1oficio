
/**
 * Utilitário para cálculo de atraso de processos por setor
 */
export function isDepartmentOverdue({
  history,
  currentDepartment,
  departmentTimeLimit,
}: {
  history: Array<{
    departmentId: string;
    entryDate: string;
    exitDate: string | null;
  }>;
  currentDepartment: string;
  departmentTimeLimit: number | null | undefined;
}): boolean {
  if (!departmentTimeLimit || !history?.length) return false;

  // Busca a entrada mais recente (sem saída) para o setor atual
  const currentEntry = history
    .filter((h) => h.departmentId === currentDepartment && h.exitDate === null)
    .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime())[0];

  if (!currentEntry) return false;

  const entrada = new Date(currentEntry.entryDate);
  const prazo = new Date(entrada);
  prazo.setDate(prazo.getDate() + departmentTimeLimit);

  return new Date() > prazo;
}
