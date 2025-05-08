
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço centralizado para gerenciar responsáveis de processos
 * Implementa padrão DRY para evitar duplicação de código entre hooks
 */
export class ProcessResponsibilityService {
  // Cache de responsáveis por processo e setor
  private static responsiblesCache: Record<string, Record<string, any>> = {};

  /**
   * Obtém o responsável global por um processo
   */
  static async getProcessResponsible(processId: string): Promise<any> {
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
      
      return data?.usuarios || null;
    } catch (error) {
      console.error(`Erro ao obter responsável pelo processo ${processId}:`, error);
      return null;
    }
  }

  /**
   * Obtém a chave de cache para um processo e setor
   */
  private static getCacheKey(processId: string, sectorId: string): string {
    return `${processId}:${sectorId}`;
  }

  /**
   * Limpa o cache de responsáveis
   */
  static clearCache(): void {
    this.responsiblesCache = {};
  }

  /**
   * Verifica se um setor tem responsável para um processo
   */
  static async hasSectorResponsible(processId: string, sectorId: string): Promise<boolean> {
    try {
      const { count, error } = await supabase
        .from('setor_responsaveis')
        .select('*', { count: 'exact', head: true })
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (error) throw error;
      
      return count !== null && count > 0;
    } catch (error) {
      console.error(`Erro ao verificar responsável para setor ${sectorId} do processo ${processId}:`, error);
      return false;
    }
  }

  /**
   * Obtém o responsável de um setor para um processo
   * Com cache para melhorar performance
   */
  static async getSectorResponsible(processId: string, sectorId: string): Promise<any> {
    // Criar chave de cache
    const cacheKey = this.getCacheKey(processId, sectorId);
    
    // Verificar cache primeiro
    if (this.responsiblesCache[cacheKey]) {
      return this.responsiblesCache[cacheKey];
    }
    
    try {
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
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();

      if (error) throw error;
      
      const responsible = data?.usuarios || null;
      
      // Armazenar no cache
      this.responsiblesCache[cacheKey] = responsible;
      
      return responsible;
    } catch (error) {
      console.error(`Erro ao obter responsável para setor ${sectorId} do processo ${processId}:`, error);
      return null;
    }
  }

  /**
   * Pré-carrega responsáveis para vários setores de um processo
   * Otimiza carregamento em listas
   */
  static async preloadProcessResponsibles(processId: string, sectorIds: string[]): Promise<Record<string, any>> {
    try {
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
        .eq('processo_id', processId)
        .in('setor_id', sectorIds);

      if (error) throw error;
      
      const responsibles: Record<string, any> = {};
      
      // Organizar por setor e atualizar cache
      data.forEach(item => {
        const sectorId = item.setor_id;
        responsibles[sectorId] = item.usuarios;
        
        // Atualizar cache
        const cacheKey = this.getCacheKey(processId, sectorId);
        this.responsiblesCache[cacheKey] = item.usuarios;
      });
      
      return responsibles;
    } catch (error) {
      console.error(`Erro ao pré-carregar responsáveis para processo ${processId}:`, error);
      return {};
    }
  }

  /**
   * Carrega todos os responsáveis para uma lista de processos
   * Otimizado para carregamento em lote
   */
  static async batchLoadResponsibles(processesIds: string[]): Promise<Record<string, Record<string, any>>> {
    try {
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
        .in('processo_id', processesIds);

      if (error) throw error;
      
      const result: Record<string, Record<string, any>> = {};
      
      // Organizar por processo e setor
      data.forEach(item => {
        const processId = item.processo_id;
        const sectorId = item.setor_id;
        
        if (!result[processId]) {
          result[processId] = {};
        }
        
        result[processId][sectorId] = item.usuarios;
        
        // Atualizar cache
        const cacheKey = this.getCacheKey(processId, sectorId);
        this.responsiblesCache[cacheKey] = item.usuarios;
      });
      
      return result;
    } catch (error) {
      console.error('Erro ao carregar responsáveis em lote:', error);
      return {};
    }
  }
}
