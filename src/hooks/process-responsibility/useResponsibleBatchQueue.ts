
import { useCallback, useRef } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { ProcessResponsible } from './types';

interface BatchQueue {
  processId: string;
  sectorId: string;
  resolve: (data: ProcessResponsible | null) => void;
  reject: (error: any) => void;
}

interface ProcessSectorMap {
  [processId: string]: Set<string>;
}

export const useResponsibleBatchQueue = () => {
  const queueRef = useRef<BatchQueue[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const processBatch = useCallback(async () => {
    if (queueRef.current.length === 0) return;

    const currentBatch = [...queueRef.current];
    queueRef.current = [];

    try {
      // Agrupar por processo para reduzir número de queries
      const processGroups = currentBatch.reduce((acc, item) => {
        if (!acc[item.processId]) {
          acc[item.processId] = new Set<string>();
        }
        acc[item.processId].add(item.sectorId);
        return acc;
      }, {} as ProcessSectorMap);

      // Processar em paralelo por processo
      const results = await Promise.all(
        Object.entries(processGroups).map(async ([processId, sectors]) => {
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
        })
      );

      // Resolver promessas e atualizar cache
      results.forEach(({ processId, data }) => {
        if (!data) return;

        data.forEach((item) => {
          const matchingQueue = currentBatch.filter(
            q => q.processId === processId && q.sectorId === item.setor_id
          );
          
          matchingQueue.forEach(q => q.resolve(item.usuarios));
        });
      });

      // Resolver promessas para itens não encontrados
      currentBatch.forEach(item => {
        const found = results.some(r => 
          r.data?.some(d => 
            d.processo_id === item.processId && d.setor_id === item.sectorId
          )
        );
        
        if (!found) {
          item.resolve(null);
        }
      });

    } catch (error) {
      currentBatch.forEach(item => item.reject(error));
    }
  }, []);

  const addToQueue = useCallback((
    processId: string,
    sectorId: string,
    resolve: (data: ProcessResponsible | null) => void,
    reject: (error: any) => void
  ) => {
    queueRef.current.push({ processId, sectorId, resolve, reject });

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(processBatch, 100);
  }, [processBatch]);

  return {
    addToQueue,
    processBatch
  };
};
