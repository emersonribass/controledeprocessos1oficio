
import { useState, useRef, useCallback } from "react";
import { ProcessResponsible } from "./types";

/**
 * Hook para gerenciar o cache de responsáveis por processos
 */
export const useProcessResponsibleCache = () => {
  // Cache para armazenar os responsáveis já buscados
  const [processResponsibleCache, setProcessResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  const [sectorResponsibleCache, setSectorResponsibleCache] = useState<Record<string, ProcessResponsible | null>>({});
  
  // Controle de requisições em andamento para evitar chamadas duplicadas
  const pendingProcessRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});
  const pendingSectorRequests = useRef<Record<string, Promise<ProcessResponsible | null>>>({});
  
  // Flag para evitar multiplas requisições
  const isFetchingRef = useRef<Record<string, boolean>>({});

  /**
   * Verifica se já existe uma requisição em andamento para um processo
   */
  const isProcessRequestPending = (processId: string): boolean => {
    return !!pendingProcessRequests.current[processId];
  };

  /**
   * Verifica se já existe uma requisição em andamento para um setor
   */
  const isSectorRequestPending = (cacheKey: string): boolean => {
    return !!pendingSectorRequests.current[cacheKey];
  };

  /**
   * Verifica se já existe uma requisição em andamento
   */
  const isRequestInProgress = (key: string): boolean => {
    return !!isFetchingRef.current[key];
  };

  /**
   * Marca uma requisição como em andamento
   */
  const markRequestInProgress = (key: string): void => {
    isFetchingRef.current[key] = true;
  };

  /**
   * Marca uma requisição como concluída
   */
  const markRequestCompleted = (key: string): void => {
    delete isFetchingRef.current[key];
  };

  /**
   * Armazena uma requisição em andamento para um processo
   */
  const storeProcessRequest = (processId: string, request: Promise<ProcessResponsible | null>): void => {
    pendingProcessRequests.current[processId] = request;
  };

  /**
   * Armazena uma requisição em andamento para um setor
   */
  const storeSectorRequest = (cacheKey: string, request: Promise<ProcessResponsible | null>): void => {
    pendingSectorRequests.current[cacheKey] = request;
  };

  /**
   * Remove uma requisição em andamento para um processo
   */
  const removeProcessRequest = (processId: string): void => {
    delete pendingProcessRequests.current[processId];
  };

  /**
   * Remove uma requisição em andamento para um setor
   */
  const removeSectorRequest = (cacheKey: string): void => {
    delete pendingSectorRequests.current[cacheKey];
  };

  /**
   * Obtém um responsável pelo processo do cache
   */
  const getProcessResponsibleFromCache = (processId: string): ProcessResponsible | null | undefined => {
    return processResponsibleCache[processId];
  };

  /**
   * Obtém um responsável pelo setor do cache
   */
  const getSectorResponsibleFromCache = (cacheKey: string): ProcessResponsible | null | undefined => {
    return sectorResponsibleCache[cacheKey];
  };

  /**
   * Obtém uma requisição em andamento para um processo
   */
  const getProcessPendingRequest = (processId: string): Promise<ProcessResponsible | null> | undefined => {
    return pendingProcessRequests.current[processId];
  };

  /**
   * Obtém uma requisição em andamento para um setor
   */
  const getSectorPendingRequest = (cacheKey: string): Promise<ProcessResponsible | null> | undefined => {
    return pendingSectorRequests.current[cacheKey];
  };

  /**
   * Atualiza o cache de responsáveis por processo
   */
  const updateProcessResponsibleCache = useCallback((processId: string, responsible: ProcessResponsible | null): void => {
    setProcessResponsibleCache(prev => ({ ...prev, [processId]: responsible }));
  }, []);

  /**
   * Atualiza o cache de responsáveis por setor
   */
  const updateSectorResponsibleCache = useCallback((cacheKey: string, responsible: ProcessResponsible | null): void => {
    setSectorResponsibleCache(prev => ({ ...prev, [cacheKey]: responsible }));
  }, []);

  /**
   * Limpa o cache de responsáveis
   */
  const clearCache = useCallback(() => {
    console.log("Limpando cache de responsáveis");
    setProcessResponsibleCache({});
    setSectorResponsibleCache({});
    pendingProcessRequests.current = {};
    pendingSectorRequests.current = {};
    isFetchingRef.current = {};
  }, []);

  return {
    // Métodos para verificação de status
    isProcessRequestPending,
    isSectorRequestPending,
    isRequestInProgress,
    
    // Métodos para controle de estado das requisições
    markRequestInProgress,
    markRequestCompleted,
    
    // Métodos para armazenamento de requisições
    storeProcessRequest,
    storeSectorRequest,
    removeProcessRequest,
    removeSectorRequest,
    
    // Métodos para acesso ao cache
    getProcessResponsibleFromCache,
    getSectorResponsibleFromCache,
    getProcessPendingRequest,
    getSectorPendingRequest,
    
    // Métodos para atualização do cache
    updateProcessResponsibleCache,
    updateSectorResponsibleCache,
    
    // Limpar cache
    clearCache
  };
};
