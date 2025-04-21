
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

  // Busca a entrada mais recente (sem saída) para o setor atual - agora mais flexível
  const currentEntry = history
    .filter((h: any) => {
      // Flexibilidade para diferentes estruturas de dados
      const departmentMatch = 
        h.departmentId === currentDepartment || 
        h.setor_id === currentDepartment || 
        h.setorId === currentDepartment;
      
      const noExit = 
        h.exitDate === null || 
        h.data_saida === null;
      
      return departmentMatch && noExit;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.entryDate || a.data_entrada).getTime();
      const dateB = new Date(b.entryDate || b.data_entrada).getTime();
      return dateB - dateA;  // Mais recente primeiro
    })[0];

  if (!currentEntry) return false;

  const entrada = new Date(currentEntry.entryDate || currentEntry.data_entrada);
  const prazo = new Date(entrada);
  prazo.setDate(prazo.getDate() + departmentTimeLimit);

  return new Date() > prazo;
}
