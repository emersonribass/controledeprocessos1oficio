
import { useState, useCallback, useRef, useEffect } from 'react';

interface CacheItem<T> {
  data: T;
  timestamp: number;
}

interface CacheOptions {
  ttl?: number; // Tempo de vida do cache em ms (padrão: 1 minuto)
  debounceTime?: number; // Tempo de debounce em ms (padrão: 300ms)
}

/**
 * Hook para realizar requisições com cache e debounce para evitar múltiplas chamadas
 */
export function useCachedFetch<T = any>(
  fetchFn: () => Promise<T>,
  options: CacheOptions = {}
) {
  const {
    ttl = 60 * 1000, // 1 minuto por padrão
    debounceTime = 300 // 300ms por padrão
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  
  const cacheRef = useRef<CacheItem<T> | null>(null);
  const fetchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);
  const currentFetchRef = useRef<Promise<T> | null>(null);

  // Limpeza dos timeouts e atualização do estado de montagem
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, []);

  const executeFetch = useCallback(async () => {
    if (currentFetchRef.current) {
      return currentFetchRef.current;
    }

    try {
      currentFetchRef.current = fetchFn();
      const result = await currentFetchRef.current;
      
      if (isMountedRef.current) {
        setData(result);
        setError(null);
        
        // Atualizar cache
        cacheRef.current = {
          data: result,
          timestamp: Date.now()
        };
      }
      
      return result;
    } catch (err) {
      if (isMountedRef.current) {
        setError(err instanceof Error ? err : new Error(String(err)));
      }
      throw err;
    } finally {
      currentFetchRef.current = null;
      if (isMountedRef.current) {
        setIsLoading(false);
      }
    }
  }, [fetchFn]);

  const fetchData = useCallback(async (forceRefresh: boolean = false) => {
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    return new Promise<T>((resolve, reject) => {
      fetchTimeoutRef.current = setTimeout(async () => {
        // Verificar se o cache é válido e não é forçada uma atualização
        if (!forceRefresh && cacheRef.current && Date.now() - cacheRef.current.timestamp < ttl) {
          if (isMountedRef.current) {
            setData(cacheRef.current.data);
          }
          resolve(cacheRef.current.data);
          return;
        }

        if (isMountedRef.current) {
          setIsLoading(true);
        }

        try {
          const result = await executeFetch();
          resolve(result);
        } catch (err) {
          reject(err instanceof Error ? err : new Error(String(err)));
        }
      }, debounceTime);
    });
  }, [ttl, debounceTime, executeFetch]);

  // Limpar cache
  const clearCache = useCallback(() => {
    cacheRef.current = null;
  }, []);

  return {
    data,
    isLoading,
    error,
    fetchData,
    clearCache
  };
}
