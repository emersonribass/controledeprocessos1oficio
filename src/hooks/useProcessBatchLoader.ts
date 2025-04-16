
import { useState, useEffect, useRef, useCallback } from "react";
import { ProcessResponsible } from "./process-responsibility/types";
import { useProcessResponsibleBatchLoader } from "./process-responsibility/useProcessResponsibleBatchLoader";

/**
 * Hook centralizado para gerenciar o carregamento em lote de responsáveis
 * Implementa otimizações para evitar requisições duplicadas e melhorar performance
 */
export const useProcessBatchLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibles, setSectorResponsibles] = useState<Record<string, ProcessResponsible | null>>({});
  
  const { loadProcessResponsibleBatch, loadSectorResponsibleBatch } = useProcessResponsibleBatchLoader();
  
  // Controle para carregamento em lote com otimização
  const batchLoadingRef = useRef(false);
  const pendingProcessIds = useRef<Set<string>>(new Set());
  const pendingSectorRequests = useRef<Map<string, { processId: string; sectorId: string }>>(new Map());
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const batchSizeRef = useRef<{ processes: number; sectors: number }>({ processes: 0, sectors: 0 });
  
  /**
   * Função para adicionar um processo ao lote de carregamento com verificação de duplicidade otimizada
   */
  const queueProcessForLoading = useCallback((processId: string): void => {
    if (!processId || processResponsibles[processId] !== undefined) {
      return;
    }
    
    // Usando Set para evitar duplicações automaticamente
    pendingProcessIds.current.add(processId);
    scheduleBatchLoad();
  }, [processResponsibles]);
  
  /**
   * Função para adicionar um setor ao lote de carregamento com verificação de duplicidade otimizada
   */
  const queueSectorForLoading = useCallback((processId: string, sectorId: string): void => {
    if (!processId || !sectorId) return;
    
    const cacheKey = `${processId}-${sectorId}`;
    if (sectorResponsibles[cacheKey] !== undefined) {
      return;
    }
    
    // Usando Map com chave composta para evitar duplicações
    pendingSectorRequests.current.set(cacheKey, { processId, sectorId });
    scheduleBatchLoad();
  }, [sectorResponsibles]);
  
  /**
   * Agenda o processamento do lote com debounce para acumular requisições
   * e reduzir chamadas desnecessárias
   */
  const scheduleBatchLoad = useCallback((): void => {
    // Atualiza contadores para logging
    batchSizeRef.current = {
      processes: pendingProcessIds.current.size,
      sectors: pendingSectorRequests.current.size
    };
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    
    if (pendingProcessIds.current.size === 0 && pendingSectorRequests.current.size === 0) {
      return;
    }
    
    // Implementação de debounce: aguarda um curto período para acumular solicitações
    timeoutRef.current = setTimeout(() => {
      processBatch();
    }, 50);
  }, []);
  
  /**
   * Processa o lote acumulado de requisições com melhorias de performance
   */
  const processBatch = useCallback(async (): Promise<void> => {
    if (batchLoadingRef.current) return;
    
    // Nada para processar
    if (pendingProcessIds.current.size === 0 && pendingSectorRequests.current.size === 0) return;
    
    // Marca início do processamento
    batchLoadingRef.current = true;
    setIsLoading(true);
    
    // Captura os itens pendentes
    const processBatch = Array.from(pendingProcessIds.current);
    const sectorBatch = Array.from(pendingSectorRequests.current.values());
    
    // Limpa as listas de pendências imediatamente para evitar duplicação
    pendingProcessIds.current.clear();
    pendingSectorRequests.current.clear();
    
    try {
      // Processamento em paralelo para melhor performance
      const promises: Promise<any>[] = [];
      
      // Processar responsáveis de processos
      if (processBatch.length > 0) {
        console.log(`Processando lote de ${processBatch.length} responsáveis de processos`);
        promises.push(
          loadProcessResponsibleBatch(processBatch).then(result => {
            setProcessResponsibles(prev => ({ ...prev, ...result }));
            return result;
          })
        );
      }
      
      // Processar responsáveis de setores
      if (sectorBatch.length > 0) {
        console.log(`Processando lote de ${sectorBatch.length} responsáveis de setores`);
        promises.push(
          loadSectorResponsibleBatch(sectorBatch).then(result => {
            setSectorResponsibles(prev => ({ ...prev, ...result }));
            return result;
          })
        );
      }
      
      // Aguarda conclusão de todos os processamentos
      await Promise.all(promises);
    } catch (error) {
      console.error("Erro ao processar lote:", error);
    } finally {
      // Libera o processador de lotes
      batchLoadingRef.current = false;
      
      // Verifica se surgiram novas solicitações durante o processamento
      if (pendingProcessIds.current.size > 0 || pendingSectorRequests.current.size > 0) {
        // Agenda novo processamento para os itens que surgiram durante a execução
        scheduleBatchLoad();
      } else {
        // Finaliza o carregamento se não há mais itens pendentes
        setIsLoading(false);
      }
    }
  }, [loadProcessResponsibleBatch, loadSectorResponsibleBatch]);
  
  /**
   * Limpa os recursos ao desmontar o componente
   */
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);
  
  /**
   * Obtém um responsável por processo do cache com tratamento de undefined
   * Coloca na fila caso não exista
   */
  const getProcessResponsible = useCallback((processId: string): ProcessResponsible | null | undefined => {
    if (!processId) return undefined;
    
    const result = processResponsibles[processId];
    
    if (result === undefined) {
      queueProcessForLoading(processId);
    }
    
    return result;
  }, [processResponsibles, queueProcessForLoading]);
  
  /**
   * Obtém um responsável por setor do cache com tratamento de undefined
   * Coloca na fila caso não exista
   */
  const getSectorResponsible = useCallback((processId: string, sectorId: string): ProcessResponsible | null | undefined => {
    if (!processId || !sectorId) return undefined;
    
    const cacheKey = `${processId}-${sectorId}`;
    const result = sectorResponsibles[cacheKey];
    
    if (result === undefined) {
      queueSectorForLoading(processId, sectorId);
    }
    
    return result;
  }, [sectorResponsibles, queueSectorForLoading]);
  
  /**
   * Função para forçar o processamento do lote atual
   */
  const forceBatchProcessing = useCallback((): void => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    processBatch();
  }, [processBatch]);
  
  /**
   * Função para limpar o cache e forçar recarregamento
   */
  const clearCache = useCallback((): void => {
    setProcessResponsibles({});
    setSectorResponsibles({});
    pendingProcessIds.current.clear();
    pendingSectorRequests.current.clear();
    
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    
    console.log("Cache de responsáveis limpo");
  }, []);
  
  return {
    isLoading,
    processResponsibles,
    sectorResponsibles,
    getProcessResponsible,
    getSectorResponsible,
    queueProcessForLoading,
    queueSectorForLoading,
    processBatch: forceBatchProcessing,
    clearCache,
    // Dados para telemetria/debugging
    pendingProcessCount: pendingProcessIds.current.size,
    pendingSectorCount: pendingSectorRequests.current.size,
    batchSizes: batchSizeRef.current
  };
};
