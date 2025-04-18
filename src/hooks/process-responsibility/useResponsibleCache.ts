
import { useCallback, useRef } from 'react';

interface ResponsibleData {
  id: string;
  nome: string;
  email: string;
}

interface CacheData {
  timestamp: number;
  data: ResponsibleData;
}

export const useResponsibleCache = (ttl: number = 5 * 60 * 1000) => {
  const cacheRef = useRef<Record<string, CacheData>>({});

  const getCacheKey = (processId: string, sectorId: string) => `${processId}:${sectorId}`;

  const getFromCache = useCallback((processId: string, sectorId: string): ResponsibleData | null => {
    const key = getCacheKey(processId, sectorId);
    const cached = cacheRef.current[key];
    
    if (cached && Date.now() - cached.timestamp < ttl) {
      return cached.data;
    }
    return null;
  }, [ttl]);

  const setInCache = useCallback((processId: string, sectorId: string, data: ResponsibleData) => {
    const key = getCacheKey(processId, sectorId);
    cacheRef.current[key] = {
      timestamp: Date.now(),
      data
    };
  }, []);

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const newCache: Record<string, CacheData> = {};
    
    Object.entries(cacheRef.current).forEach(([key, value]) => {
      if (now - value.timestamp <= ttl) {
        newCache[key] = value;
      }
    });
    
    cacheRef.current = newCache;
  }, [ttl]);

  return {
    getFromCache,
    setInCache,
    cleanExpiredCache
  };
};
