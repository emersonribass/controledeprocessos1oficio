
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
    
    // Eliminar IDs duplicados
    const uniqueIds = [...new Set(processIds)];
    
    // Carregar em paralelo usando Promise.all para melhor desempenho
    const promises = uniqueIds.map(async (id) => {
      const responsible = await getProcessResponsible(id);
      return { id, responsible };
    });
    
    const results = await Promise.all(promises);
    
    // Converter array de resultados para um objeto indexado por ID do processo
    return results.reduce<Record<string, ProcessResponsible | null>>(
      (acc, { id, responsible }) => {
        acc[id] = responsible;
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
    
    // Eliminar duplicatas baseadas na combinação processId-sectorId
    const uniqueItems = Array.from(
      new Map(items.map(item => [`${item.processId}-${item.sectorId}`, item])).values()
    );
    
    // Carregar em paralelo usando Promise.all para melhor desempenho
    const promises = uniqueItems.map(async ({ processId, sectorId }) => {
      const responsible = await getSectorResponsible(processId, sectorId);
      return { key: `${processId}-${sectorId}`, responsible };
    });
    
    const results = await Promise.all(promises);
    
    // Converter array de resultados para um objeto indexado pela chave composta
    return results.reduce<Record<string, ProcessResponsible | null>>(
      (acc, { key, responsible }) => {
        acc[key] = responsible;
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
