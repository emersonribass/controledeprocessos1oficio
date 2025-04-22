
import { useState, useCallback, useRef, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { Process } from '@/types';
import { ProcessResponsible } from './types';

interface BatchQueue {
  processId: string;
  sectorId: string;
  resolve: (data: ProcessResponsible | null) => void;
  reject: (error: any) => void;
}

export const useResponsibilityLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Record<string, {timestamp: number, data: ProcessResponsible}>>({});
  const batchQueueRef = useRef<BatchQueue[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  const BATCH_DELAY = 100; // 100ms para agrupar requisições

  // Função para criar chave de cache
  const getCacheKey = (processId: string, sectorId: string) => `${processId}:${sectorId}`;

  // Limpar cache expirado
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    Object.entries(cacheRef.current).forEach(([key, value]) => {
      if (now - value.timestamp > CACHE_TTL) {
        delete cacheRef.current[key];
      }
    });
  }, []);

  // Processar fila em lote
  const processBatchQueue = useCallback(async () => {
    if (batchQueueRef.current.length === 0) return;
    
    setIsLoading(true);
    const currentBatch = [...batchQueueRef.current];
    batchQueueRef.current = [];

    try {
      // Agrupar por processo para reduzir número de queries
      const processGroups = currentBatch.reduce((acc, item) => {
        if (!acc[item.processId]) {
          acc[item.processId] = new Set();
        }
        acc[item.processId].add(item.sectorId);
        return acc;
      }, {} as Record<string, Set<string>>);

      // Fazer queries em paralelo por processo
      const queries = Object.entries(processGroups).map(async ([processId, sectors]) => {
        const { data, error } = await supabase
          .from('setor_responsaveis')
          .select(`
            processo_id,
            setor_id,
            usuario_id,
            usuarios:usuario_id (
              id,
              nome,
              email
            )
          `)
          .eq('processo_id', processId)
          .in('setor_id', Array.from(sectors));

        if (error) throw error;
        return { processId, data };
      });

      const results = await Promise.all(queries);

      // Atualizar cache e resolver promessas
      results.forEach(({ processId, data }) => {
        if (!data) return;

        data.forEach((item) => {
          const cacheKey = getCacheKey(processId, item.setor_id);
          const responsibleData = item.usuarios as ProcessResponsible;
          
          // Atualizar cache
          cacheRef.current[cacheKey] = {
            timestamp: Date.now(),
            data: responsibleData
          };

          // Resolver promessas correspondentes
          currentBatch
            .filter(q => q.processId === processId && q.sectorId === item.setor_id)
            .forEach(q => q.resolve(responsibleData));
        });
      });

      // Resolver promessas para itens sem responsável
      currentBatch.forEach(item => {
        const cacheKey = getCacheKey(item.processId, item.sectorId);
        if (!cacheRef.current[cacheKey]) {
          item.resolve(null);
        }
      });

    } catch (error) {
      console.error('Erro ao buscar responsáveis em lote:', error);
      currentBatch.forEach(item => item.reject(error));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Carregar responsável
  const loadResponsible = useCallback((processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
    const cacheKey = getCacheKey(processId, sectorId);
    const cached = cacheRef.current[cacheKey];

    // Verificar cache válido
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data);
    }

    // Adicionar à fila de batch
    return new Promise((resolve, reject) => {
      batchQueueRef.current.push({ processId, sectorId, resolve, reject });

      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Agendar processamento do lote
      timeoutRef.current = setTimeout(() => {
        processBatchQueue();
      }, BATCH_DELAY);
    });
  }, [processBatchQueue]);

  // Pré-carregar responsáveis para uma lista de processos
  const preloadResponsibles = useCallback(async (processes: Process[]) => {
    const processIds = processes.map(p => p.id);
    const { data: history, error } = await supabase
      .from('processos_historico')
      .select('processo_id, setor_id')
      .in('processo_id', processIds);

    if (error) {
      console.error('Erro ao buscar histórico para preload:', error);
      return;
    }

    // Carregar todos os responsáveis em paralelo
    const loadPromises = history.map(({ processo_id, setor_id }) => 
      loadResponsible(processo_id, setor_id)
    );

    await Promise.all(loadPromises);
  }, [loadResponsible]);

  // Limpar cache e timeouts ao desmontar
  useEffect(() => {
    const interval = setInterval(cleanExpiredCache, CACHE_TTL);
    
    return () => {
      clearInterval(interval);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [cleanExpiredCache]);

  return {
    loadResponsible,
    preloadResponsibles,
    isLoading
  };
};
