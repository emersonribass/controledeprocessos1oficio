
import { createLogger } from "./loggerUtils";

const logger = createLogger("HistoryService");

/**
 * Interface para representar uma entrada do histórico de processos
 */
export interface HistoryEntry {
  id?: number;
  historico_id?: number;
  id_historico?: number;
  processo_id?: string;
  data_entrada?: string;
  entryDate?: string;
  data_saida?: string | null;
  exitDate?: string | null;
  usuario_id?: string;
  userId?: string;
  setor_id?: string;
  setorId?: string;
  departmentId?: string;
  [key: string]: any; // Para quaisquer outros campos
}

/**
 * Classe de serviço para operações relacionadas ao histórico de processos
 */
export class ProcessHistoryService {
  /**
   * Extrai o ID do histórico a partir de várias estratégias
   */
  static extractHistoryId(historyEntry: HistoryEntry | null | undefined): number | undefined {
    if (!historyEntry) {
      logger.warn("Entrada de histórico vazia ou indefinida");
      return undefined;
    }
    
    logger.debug("Extraindo ID do histórico:", historyEntry);
    
    // Estratégia 1: ID direto
    if (typeof historyEntry.id === 'number') {
      logger.debug(`ID numérico direto encontrado: ${historyEntry.id}`);
      return historyEntry.id;
    }
    
    // Estratégia 2: Campos alternativos para ID
    const idFields = ['historico_id', 'id_historico', 'historyId'];
    for (const field of idFields) {
      if (typeof historyEntry[field] === 'number') {
        logger.debug(`ID encontrado no campo ${field}: ${historyEntry[field]}`);
        return historyEntry[field];
      }
    }
    
    // Estratégia 3: Tentativa de converter string para número
    if (typeof historyEntry.id === 'string' && !isNaN(Number(historyEntry.id))) {
      const numericId = Number(historyEntry.id);
      logger.debug(`ID string convertido para número: ${numericId}`);
      return numericId;
    }
    
    for (const field of idFields) {
      if (typeof historyEntry[field] === 'string' && !isNaN(Number(historyEntry[field]))) {
        const numericId = Number(historyEntry[field]);
        logger.debug(`${field} string convertido para número: ${numericId}`);
        return numericId;
      }
    }
    
    // Estratégia 4: Fallback para processo_id
    if (historyEntry.processo_id) {
      logger.debug(`Usando processo_id como fallback: ${historyEntry.processo_id}`);
      // Criando um hash baseado no ID do processo
      try {
        const fallbackId = parseInt(String(historyEntry.processo_id).replace(/\D/g, '').slice(0, 8));
        if (!isNaN(fallbackId) && fallbackId > 0) {
          return fallbackId;
        }
      } catch (e) {
        logger.error("Erro ao usar fallback do processo_id:", e);
      }
    }
    
    // Estratégia 5: Criar um ID sintético a partir dos dados disponíveis
    // Isso é necessário porque o objeto em alguns casos tem apenas departmentId, entryDate, exitDate, userId
    try {
      logger.debug("Criando ID sintético a partir dos dados disponíveis");
      
      // Priorizar campos relacionados a datas
      const dateStr = historyEntry.entryDate || historyEntry.data_entrada || new Date().toISOString();
      const deptStr = historyEntry.departmentId || historyEntry.setor_id || historyEntry.setorId || "0";
      const userStr = historyEntry.userId || historyEntry.usuario_id || "0";
      
      // Criar uma combinação única que podemos converter em um número
      const hashBase = `${dateStr}_${deptStr}_${userStr}`;
      
      // Um método simples para converter a string em número
      let numericHash = 0;
      for (let i = 0; i < hashBase.length; i++) {
        const char = hashBase.charCodeAt(i);
        numericHash = ((numericHash << 5) - numericHash) + char;
        numericHash = numericHash & numericHash; // Converter para 32bit int
      }
      
      // Garantir que seja positivo e não muito grande
      const syntheticId = Math.abs(numericHash) % 1000000;
      
      logger.info(`ID sintético criado: ${syntheticId} para entryDate=${dateStr}, deptId=${deptStr}`);
      return syntheticId;
    } catch (e) {
      logger.error("Erro ao criar ID sintético:", e);
    }
    
    // Logar campos disponíveis para depuração
    logger.warn("Não foi possível extrair ID. Campos disponíveis:", Object.keys(historyEntry));
    return undefined;
  }

  /**
   * Encontra a entrada mais recente do histórico para um determinado setor
   */
  static findLatestHistoryEntry(
    history: HistoryEntry[] | null | undefined,
    currentDepartment: string | number | null | undefined
  ): HistoryEntry | undefined {
    if (!history || !Array.isArray(history) || history.length === 0 || !currentDepartment) {
      logger.warn(`Histórico vazio ou setor indefinido. History: ${!!history}, Setor: ${currentDepartment}`);
      return undefined;
    }

    logger.debug(`Buscando entrada para o setor ${currentDepartment} em ${history.length} registros`);
    
    const departmentFilters = [
      (h: HistoryEntry) => h.departmentId === currentDepartment,
      (h: HistoryEntry) => h.setor_id === currentDepartment,
      (h: HistoryEntry) => h.setorId === currentDepartment
    ];
    
    const exitFilters = [
      (h: HistoryEntry) => h.exitDate === null,
      (h: HistoryEntry) => h.data_saida === null
    ];
    
    const filteredEntries = history.filter(h => 
      departmentFilters.some(filter => filter(h)) && 
      exitFilters.some(filter => filter(h))
    );
    
    logger.debug(`Encontradas ${filteredEntries.length} entradas para o setor atual`);
    
    if (filteredEntries.length === 0) return undefined;
    
    // Ordenar por data de entrada mais recente
    const sortedEntries = [...filteredEntries].sort((a, b) => {
      const dateA = new Date(a.entryDate || a.data_entrada || "0").getTime();
      const dateB = new Date(b.entryDate || b.data_entrada || "0").getTime();
      return dateB - dateA;
    });
    
    logger.debug("Entrada mais recente:", sortedEntries[0]);
    return sortedEntries[0];
  }
}
