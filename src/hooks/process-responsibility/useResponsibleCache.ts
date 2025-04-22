
import { useCallback, useRef } from 'react';
import { ProcessResponsible } from './types';

interface CacheItem {
  data: ProcessResponsible | null;
  timestamp: number;
}

export const useResponsibleCache = () => {
  const cacheRef = useRef<Record<string, CacheItem>>({});
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

  // Criar chave de cache
  const createCacheKey = (processId: string, sectorId: string) => `${processId}:${sectorId}`;

  // Obter dados do cache
  const getFromCache = useCallback((processId: string, sectorId: string): ProcessResponsible | null => {
    const key = createCacheKey(processId, sectorId);
    const item = cacheRef.current[key];
    
    if (item && Date.now() - item.timestamp < CACHE_TTL) {
      return item.data;
    }
    
    return null;
  }, []);

  // Armazenar no cache
  const setInCache = useCallback((processId: string, sectorId: string, data: ProcessResponsible | null) => {
    const key = createCacheKey(processId, sectorId);
    cacheRef.current[key] = {
      data,
      timestamp: Date.now()
    };
  }, []);

  // Limpar itens expirados do cache
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    
    Object.keys(cacheRef.current).forEach(key => {
      if (now - cacheRef.current[key].timestamp > CACHE_TTL) {
        delete cacheRef.current[key];
      }
    });
  }, []);

  // Limpar todo o cache
  const clearCache = useCallback(() => {
    cacheRef.current = {};
  }, []);

  return {
    getFromCache,
    setInCache,
    cleanExpiredCache,
    clearCache
  };
};
