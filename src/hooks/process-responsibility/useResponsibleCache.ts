
import { useCallback, useRef } from 'react';

interface ResponsibleData {
  id: string;
  nome: string;
  email: string;
}

interface CacheEntry {
  timestamp: number;
  data: ResponsibleData | null;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useResponsibleCache = () => {
  // Cache de responsáveis: {processId-sectorId: {timestamp, data}}
  const cacheRef = useRef<Record<string, CacheEntry>>({});

  // Gerar chave de cache
  const getCacheKey = useCallback((processId: string, sectorId: string): string => {
    return `${processId}:${sectorId}`;
  }, []);

  // Obter responsável do cache
  const getFromCache = useCallback((processId: string, sectorId: string): ResponsibleData | null => {
    const key = getCacheKey(processId, sectorId);
    const entry = cacheRef.current[key];
    
    if (entry && (Date.now() - entry.timestamp < CACHE_TTL)) {
      return entry.data;
    }
    
    return null;
  }, [getCacheKey]);

  // Armazenar responsável no cache
  const setInCache = useCallback((processId: string, sectorId: string, data: ResponsibleData | null): void => {
    const key = getCacheKey(processId, sectorId);
    
    cacheRef.current[key] = {
      timestamp: Date.now(),
      data
    };
  }, [getCacheKey]);

  // Limpar entradas expiradas do cache
  const cleanExpiredCache = useCallback((): void => {
    const now = Date.now();
    
    Object.keys(cacheRef.current).forEach(key => {
      const entry = cacheRef.current[key];
      
      if (now - entry.timestamp > CACHE_TTL) {
        delete cacheRef.current[key];
      }
    });
  }, []);

  // Invalidar uma entrada específica do cache
  const invalidateCache = useCallback((processId: string, sectorId: string): void => {
    const key = getCacheKey(processId, sectorId);
    delete cacheRef.current[key];
  }, [getCacheKey]);

  // Limpar todo o cache
  const clearCache = useCallback((): void => {
    cacheRef.current = {};
  }, []);

  return {
    getFromCache,
    setInCache,
    cleanExpiredCache,
    invalidateCache,
    clearCache
  };
};
