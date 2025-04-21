
/**
 * Extrai o ID do histórico usando várias estratégias
 */
export const extractHistoryId = (historyEntry: any): number | undefined => {
  console.log(`[extractHistoryId] Extraindo ID de:`, historyEntry);
  
  // Estratégia 1: ID direto
  if (typeof historyEntry.id === 'number') {
    console.log(`[extractHistoryId] Encontrado ID numérico direto: ${historyEntry.id}`);
    return historyEntry.id;
  }
  
  // Estratégia 2: Campos alternativos
  if (typeof historyEntry.historyId === 'number') {
    console.log(`[extractHistoryId] Encontrado historyId: ${historyEntry.historyId}`);
    return historyEntry.historyId;
  }
  
  if (typeof historyEntry.id_historico === 'number') {
    console.log(`[extractHistoryId] Encontrado id_historico: ${historyEntry.id_historico}`);
    return historyEntry.id_historico;
  }
  
  if (typeof historyEntry.historico_id === 'number') {
    console.log(`[extractHistoryId] Encontrado historico_id: ${historyEntry.historico_id}`);
    return historyEntry.historico_id;
  }
  
  // Estratégia 3: Conversão de string para número
  if (typeof historyEntry.id === 'string' && !isNaN(Number(historyEntry.id))) {
    console.log(`[extractHistoryId] Convertendo ID string para número: ${historyEntry.id}`);
    return Number(historyEntry.id);
  }
  
  if (typeof historyEntry.processo_id === 'string' && !isNaN(Number(historyEntry.processo_id))) {
    console.log(`[extractHistoryId] Usando processo_id como fallback: ${historyEntry.processo_id}`);
    return Number(historyEntry.processo_id);
  }
  
  // Se nenhuma estratégia funcionou, criamos um ID baseado no processo ou mapeamos um valor fixo
  // para debug e verificaremos na próxima etapa
  if (historyEntry.processo_id) {
    console.log(`[extractHistoryId] Gerando ID alternativo baseado no processo_id: ${historyEntry.processo_id}`);
    // Criamos um hash simples baseado no ID do processo - isto é apenas para fins de depuração
    const fallbackId = parseInt(String(historyEntry.processo_id).replace(/\D/g, '').substring(0, 8));
    return fallbackId || 1;
  }
  
  // Log de campos disponíveis para depuração
  console.log(`[extractHistoryId] Não foi possível extrair ID. Campos disponíveis:`, Object.keys(historyEntry));
  
  return undefined;
};

/**
 * Encontra a entrada mais recente do histórico para um determinado setor
 */
export const findLatestHistoryEntry = (
  history: any[],
  currentDepartment: string | number
): any | undefined => {
  if (!history || !history.length) {
    console.log(`[findLatestHistoryEntry] Histórico vazio ou inexistente`);
    return undefined;
  }

  console.log(`[findLatestHistoryEntry] Buscando entrada para o setor ${currentDepartment} em ${history.length} registros`);
  
  const filteredEntries = history.filter((h: any) => {
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
  });
  
  console.log(`[findLatestHistoryEntry] Encontradas ${filteredEntries.length} entradas para o setor atual`);
  
  if (filteredEntries.length === 0) return undefined;
  
  const sortedEntries = filteredEntries.sort((a: any, b: any) => {
    const dateA = new Date(a.entryDate || a.data_entrada || "").getTime();
    const dateB = new Date(b.entryDate || b.data_entrada || "").getTime();
    return dateB - dateA;
  });
  
  console.log(`[findLatestHistoryEntry] Entrada mais recente:`, sortedEntries[0]);
  return sortedEntries[0];
};
