
import { useCallback } from "react";
import { useProcessResponsibleFetcher } from "./useProcessResponsibleFetcher";
import { useSectorResponsibleFetcher } from "./useSectorResponsibleFetcher";
import { ProcessResponsible } from "./types";

/**
 * Hook para carregamento em lote de responsáveis de processos
 * Implementa otimização para evitar requisições repetidas e melhorar desempenho
 */
export const useProcessResponsibleBatchLoader = () => {
  const { getProcessResponsible, fetchUserById } = useProcessResponsibleFetcher();
  const { getSectorResponsible } = useSectorResponsibleFetcher();
  
  /**
   * Carrega responsáveis de múltiplos processos em uma única operação em lote
   * @param processIds IDs de processos para carregar responsáveis
   * @returns Objeto mapeando IDs de processos para seus responsáveis
   */
  const loadProcessResponsibleBatch = useCallback(async (
    processIds: string[]
  ): Promise<Record<string, ProcessResponsible | null>> => {
    if (!processIds.length) return {};
    
    console.log(`Carregando lote de ${processIds.length} responsáveis de processos`);
    
    // Eliminar IDs duplicados usando Set
    const uniqueIds = [...new Set(processIds)];
    
    // Usar Promise.allSettled para garantir que erros individuais não interrompam todo o lote
    const promises = uniqueIds.map(async (id) => {
      try {
        const responsible = await getProcessResponsible(id);
        return { id, responsible, status: 'fulfilled' };
      } catch (error) {
        console.error(`Erro ao carregar responsável para processo ${id}:`, error);
        return { id, responsible: null, status: 'rejected', reason: error };
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // Converter array de resultados para um objeto indexado por ID do processo
    return results.reduce<Record<string, ProcessResponsible | null>>(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          acc[data.id] = data.responsible;
        } else {
          // Em caso de falha, registra o erro mas continua processando
          console.error("Falha no carregamento de responsável:", result.reason);
        }
        return acc;
      }, 
      {}
    );
  }, [getProcessResponsible]);
  
  /**
   * Carrega responsáveis de múltiplos setores em uma única operação em lote
   * @param items Array de objetos contendo processId e sectorId
   * @returns Objeto mapeando chaves formatadas (processId-sectorId) para seus responsáveis
   */
  const loadSectorResponsibleBatch = useCallback(async (
    items: Array<{ processId: string, sectorId: string }>
  ): Promise<Record<string, ProcessResponsible | null>> => {
    if (!items.length) return {};
    
    console.log(`Carregando lote de ${items.length} responsáveis de setores`);
    
    // Eliminar duplicatas usando Map com chave composta
    const uniqueItemsMap = new Map(
      items.map(item => [`${item.processId}-${item.sectorId}`, item])
    );
    const uniqueItems = Array.from(uniqueItemsMap.values());
    
    // Usar Promise.allSettled para garantir que erros individuais não interrompam todo o lote
    const promises = uniqueItems.map(async ({ processId, sectorId }) => {
      try {
        const key = `${processId}-${sectorId}`;
        const responsible = await getSectorResponsible(processId, sectorId);
        return { key, responsible, status: 'fulfilled' };
      } catch (error) {
        const key = `${processId}-${sectorId}`;
        console.error(`Erro ao carregar responsável para setor ${processId}-${sectorId}:`, error);
        return { key, responsible: null, status: 'rejected', reason: error };
      }
    });
    
    const results = await Promise.allSettled(promises);
    
    // Converter array de resultados para um objeto indexado pela chave composta
    return results.reduce<Record<string, ProcessResponsible | null>>(
      (acc, result) => {
        if (result.status === 'fulfilled') {
          const data = result.value;
          acc[data.key] = data.responsible;
        } else {
          // Em caso de falha, registra o erro mas continua processando
          console.error("Falha no carregamento de responsável de setor:", result.reason);
        }
        return acc;
      }, 
      {}
    );
  }, [getSectorResponsible]);
  
  return {
    loadProcessResponsibleBatch,
    loadSectorResponsibleBatch
  };
};
