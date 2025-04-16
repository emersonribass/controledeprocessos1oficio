
import { useState, useRef, useCallback } from "react";

/**
 * Hook especializado para gerenciar cache de responsáveis por processos
 * Evita múltiplas consultas ao backend para os mesmos dados
 */
export const useResponsibleCache = () => {
  // Cache de responsáveis: { processId: { sectorId: responsibleData } }
  const [cache, setCache] = useState<Record<string, Record<string, any>>>({});
  
  // Controle de requisições em andamento para evitar duplicação
  const pendingRequests = useRef<Record<string, boolean>>({});
  
  // Último timestamp de atualização do cache
  const lastUpdated = useRef<Record<string, number>>({});
  
  // Tempo máximo de validade do cache em ms (5 minutos)
  const CACHE_TTL = 5 * 60 * 1000;
  
  /**
   * Verifica se o cache para um processo/setor específico está válido
   */
  const isCacheValid = useCallback((processId: string, sectorId: string): boolean => {
    const cacheKey = `${processId}-${sectorId}`;
    const lastUpdate = lastUpdated.current[cacheKey] || 0;
    const now = Date.now();
    
    return (
      cache[processId] !== undefined &&
      cache[processId][sectorId] !== undefined &&
      (now - lastUpdate) < CACHE_TTL
    );
  }, [cache]);
  
  /**
   * Obtém um responsável do cache
   */
  const getFromCache = useCallback((processId: string, sectorId: string): any | null => {
    if (isCacheValid(processId, sectorId)) {
      return cache[processId]?.[sectorId] || null;
    }
    return null;
  }, [cache, isCacheValid]);
  
  /**
   * Adiciona um responsável ao cache
   */
  const addToCache = useCallback((processId: string, sectorId: string, data: any): void => {
    const cacheKey = `${processId}-${sectorId}`;
    
    setCache(prevCache => {
      const processCopy = { ...(prevCache[processId] || {}) };
      processCopy[sectorId] = data;
      
      return {
        ...prevCache,
        [processId]: processCopy
      };
    });
    
    // Atualiza o timestamp
    lastUpdated.current[cacheKey] = Date.now();
  }, []);
  
  /**
   * Remove um registro específico do cache
   */
  const invalidateCache = useCallback((processId: string, sectorId?: string): void => {
    if (sectorId) {
      // Invalidar apenas um setor específico
      const cacheKey = `${processId}-${sectorId}`;
      delete lastUpdated.current[cacheKey];
      
      setCache(prevCache => {
        if (!prevCache[processId]) return prevCache;
        
        const processCopy = { ...prevCache[processId] };
        delete processCopy[sectorId];
        
        return {
          ...prevCache,
          [processId]: processCopy
        };
      });
    } else {
      // Invalidar todos os setores deste processo
      Object.keys(lastUpdated.current).forEach(key => {
        if (key.startsWith(`${processId}-`)) {
          delete lastUpdated.current[key];
        }
      });
      
      setCache(prevCache => {
        const newCache = { ...prevCache };
        delete newCache[processId];
        return newCache;
      });
    }
  }, []);
  
  /**
   * Verifica se uma requisição para este processo/setor está em andamento
   */
  const isRequestPending = useCallback((processId: string, sectorId: string): boolean => {
    const requestKey = `${processId}-${sectorId}`;
    return !!pendingRequests.current[requestKey];
  }, []);
  
  /**
   * Marca uma requisição como em andamento
   */
  const setRequestPending = useCallback((processId: string, sectorId: string, isPending: boolean): void => {
    const requestKey = `${processId}-${sectorId}`;
    if (isPending) {
      pendingRequests.current[requestKey] = true;
    } else {
      delete pendingRequests.current[requestKey];
    }
  }, []);
  
  return {
    getFromCache,
    addToCache,
    invalidateCache,
    isRequestPending,
    setRequestPending,
    isCacheValid
  };
};
