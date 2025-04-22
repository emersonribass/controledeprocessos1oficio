
import { useState, useCallback } from "react";
import { ProcessResponsible } from "./types";

interface CacheEntry {
  data: ProcessResponsible | null;
  timestamp: number;
}

interface ResponsibilityCache {
  [key: string]: CacheEntry;
}

const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

export const useResponsibleCache = () => {
  const [cache, setCache] = useState<ResponsibilityCache>({});

  const getFromCache = useCallback((processId: string, sectorId: string): ProcessResponsible | null => {
    const key = `${processId}:${sectorId}`;
    const entry = cache[key];
    
    if (!entry) return null;
    
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      // Remove entrada expirada
      const newCache = { ...cache };
      delete newCache[key];
      setCache(newCache);
      return null;
    }
    
    return entry.data;
  }, [cache]);

  const setInCache = useCallback((processId: string, sectorId: string, data: ProcessResponsible | null) => {
    setCache(prev => ({
      ...prev,
      [`${processId}:${sectorId}`]: {
        data,
        timestamp: Date.now()
      }
    }));
  }, []);

  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    setCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (now - newCache[key].timestamp > CACHE_TTL) {
          delete newCache[key];
        }
      });
      return newCache;
    });
  }, []);

  return {
    getFromCache,
    setInCache,
    cleanExpiredCache
  };
};

