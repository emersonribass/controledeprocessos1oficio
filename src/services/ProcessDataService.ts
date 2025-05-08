
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types";

interface ResponsibleData {
  id: string;
  nome: string;
  email: string;
}

// Cache de responsáveis por processo e setor
type ResponsiblesCache = {
  [processId: string]: {
    [sectorId: string]: {
      data: ResponsibleData | null;
      timestamp: number;
    }
  }
};

// Tempo de vida do cache em milissegundos (5 minutos)
const CACHE_TTL = 5 * 60 * 1000;

class ProcessDataService {
  private responsiblesCache: ResponsiblesCache = {};

  /**
   * Limpa o cache de responsáveis expirados
   */
  cleanExpiredCache() {
    const now = Date.now();
    Object.keys(this.responsiblesCache).forEach(processId => {
      const processSectors = this.responsiblesCache[processId];
      Object.keys(processSectors).forEach(sectorId => {
        if (now - processSectors[sectorId].timestamp > CACHE_TTL) {
          delete processSectors[sectorId];
        }
      });
      if (Object.keys(processSectors).length === 0) {
        delete this.responsiblesCache[processId];
      }
    });
  }

  /**
   * Limpa todo o cache de responsáveis
   */
  clearCache() {
    this.responsiblesCache = {};
  }

  /**
   * Obtém responsável de um processo em um setor específico
   */
  async getResponsibleForSector(processId: string, sectorId: string): Promise<ResponsibleData | null> {
    // Verificar se existe no cache e não expirou
    const cached = this.responsiblesCache[processId]?.[sectorId];
    const now = Date.now();
    if (cached && now - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }

    try {
      // Buscar do banco de dados
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select(`
          usuario_id,
          usuarios:usuario_id (
            id,
            nome,
            email
          )
        `)
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();

      if (error) throw error;

      const responsible = data?.usuarios as ResponsibleData | null;

      // Armazenar no cache
      if (!this.responsiblesCache[processId]) {
        this.responsiblesCache[processId] = {};
      }
      this.responsiblesCache[processId][sectorId] = {
        data: responsible,
        timestamp: now
      };

      return responsible;
    } catch (error) {
      console.error(`Erro ao obter responsável para processo ${processId} no setor ${sectorId}:`, error);
      return null;
    }
  }

  /**
   * Obtém o responsável global de um processo
   */
  async getProcessResponsible(processId: string): Promise<ResponsibleData | null> {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          usuario_responsavel,
          usuarios!processos_usuario_responsavel_fkey (
            id,
            nome,
            email
          )
        `)
        .eq('id', processId)
        .maybeSingle();

      if (error) throw error;
      
      return data?.usuarios as ResponsibleData | null;
    } catch (error) {
      console.error(`Erro ao obter responsável global do processo ${processId}:`, error);
      return null;
    }
  }

  /**
   * Verifica se existe um responsável para o processo no setor
   */
  async hasSectorResponsible(processId: string, sectorId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('setor_responsaveis')
        .select('*', { count: 'exact', head: true })
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (error) throw error;
      
      return count !== null && count > 0;
    } catch (error) {
      console.error(`Erro ao verificar existência de responsável para processo ${processId} no setor ${sectorId}:`, error);
      return false;
    }
  }

  /**
   * Busca todos os responsáveis por setor para um conjunto de processos em uma única query
   */
  async batchFetchResponsibles(processes: Process[]): Promise<Record<string, Record<string, ResponsibleData>>> {
    if (!processes.length) return {};

    try {
      // Extrair IDs de processos
      const processIds = processes.map(p => p.id);
      
      // Buscar todos os responsáveis de setor para os processos
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select(`
          processo_id,
          setor_id,
          usuario_id,
          usuarios:usuario_id (
            id,
            nome,
            email
          )
        `)
        .in('processo_id', processIds);

      if (error) throw error;

      // Organizar os resultados por processo e setor
      const result: Record<string, Record<string, ResponsibleData>> = {};
      
      data.forEach(item => {
        if (!result[item.processo_id]) {
          result[item.processo_id] = {};
        }
        result[item.processo_id][item.setor_id] = item.usuarios as ResponsibleData;
        
        // Atualizar o cache ao mesmo tempo
        if (!this.responsiblesCache[item.processo_id]) {
          this.responsiblesCache[item.processo_id] = {};
        }
        this.responsiblesCache[item.processo_id][item.setor_id] = {
          data: item.usuarios as ResponsibleData,
          timestamp: Date.now()
        };
      });

      return result;
    } catch (error) {
      console.error('Erro ao buscar responsáveis em lote:', error);
      return {};
    }
  }
}

// Exportar uma instância única do serviço
export const processDataService = new ProcessDataService();
