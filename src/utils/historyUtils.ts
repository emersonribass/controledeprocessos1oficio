
/**
 * Extrai o ID do histórico usando várias estratégias
 */
export const extractHistoryId = (historyEntry: any): number | undefined => {
  // Estratégia 1: ID direto
  if (typeof historyEntry.id === 'number') {
    return historyEntry.id;
  }
  
  // Estratégia 2: Campos alternativos
  if (typeof historyEntry.historyId === 'number') {
    return historyEntry.historyId;
  }
  
  if (typeof historyEntry.id_historico === 'number') {
    return historyEntry.id_historico;
  }
  
  if (typeof historyEntry.historico_id === 'number') {
    return historyEntry.historico_id;
  }
  
  // Estratégia 3: Conversão de string para número
  if (typeof historyEntry.id === 'string' && !isNaN(Number(historyEntry.id))) {
    return Number(historyEntry.id);
  }
  
  return undefined;
};

/**
 * Encontra a entrada mais recente do histórico para um determinado setor
 */
export const findLatestHistoryEntry = (
  history: any[],
  currentDepartment: string | number
): any | undefined => {
  return history
    .filter((h: any) => {
      const departmentMatch = (
        h.departmentId === currentDepartment ||
        h.setor_id === currentDepartment ||
        h.setorId === currentDepartment
      );
      
      const noExit = (
        h.exitDate === null || 
        h.data_saida === null
      );
      
      return departmentMatch && noExit;
    })
    .sort((a: any, b: any) => {
      const dateA = new Date(a.entryDate || a.data_entrada || "").getTime();
      const dateB = new Date(b.entryDate || b.data_entrada || "").getTime();
      return dateB - dateA;
    })[0];
};

