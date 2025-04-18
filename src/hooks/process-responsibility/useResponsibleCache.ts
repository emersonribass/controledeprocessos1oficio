
import { useCallback, useRef } from 'react';
import { ProcessResponsible } from './types';

interface CacheData {
  data: ProcessResponsible;
  timestamp: number;
}

interface CacheMap {
  [key: string]: CacheData;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useResponsibleCache = () => {
  const cacheRef = useRef<CacheMap>({});

  const getCacheKey = (processId: string, sectorId: string) => 
    `${processId}:${sectorId}`;

  const getFromCache = useCallback((processId: string, sectorId: string): ProcessResponsible | null => {
    const key = getCacheKey(processId, sectorId);
    const cached = cacheRef.current[key];
    
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return cached.data;
    }
    
    return null;
  }, []);

  const setInCache = useCallback((processId: string, sectorId: string, data: ProcessResponsible) => {
    const key = getCacheKey(processId, sectorId);
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    };
  }, []);

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    Object.keys(cacheRef.current).forEach(key => {
      if (now - cacheRef.current[key].timestamp > CACHE_TTL) {
        delete cacheRef.current[key];
      }
    });
  }, []);

  return {
    getFromCache,
    setInCache,
    cleanExpiredCache
  };
};
