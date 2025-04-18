
import { useCallback, useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";

interface ResponsibleData {
  id: string;
  nome: string;
  email: string;
}

interface CacheData {
  timestamp: number;
  data: ResponsibleData;
}

interface BatchQueue {
  processId: string;
  sectorId: string;
  resolve: (data: ResponsibleData | null) => void;
  reject: (error: any) => void;
}

interface ProcessSectorMap {
  [processId: string]: Set<string>;
}

export const useResponsibleBatchLoader = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const cacheRef = useRef<Record<string, CacheData>>({});
  const batchQueueRef = useRef<BatchQueue[]>([]);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const processSectorMapRef = useRef<ProcessSectorMap>({});
  
  const CACHE_TTL = 5 * 60 * 1000; // 5 minutos
  const BATCH_DELAY = 100; // 100ms para agrupar requisições
  const MAX_BATCH_SIZE = 50; // Limite máximo de requisições por lote
  
  // Função otimizada para criar chave de cache
  const getCacheKey = (processId: string, sectorId: string) => `${processId}:${sectorId}`;

  // Limpar cache expirado e otimizar memória
  const cleanExpiredCache = useCallback(() => {
    const now = Date.now();
    const newCache: Record<string, CacheData> = {};
    
    Object.entries(cacheRef.current).forEach(([key, value]) => {
      if (now - value.timestamp <= CACHE_TTL) {
        newCache[key] = value;
      }
    });
    
    cacheRef.current = newCache;
  }, []);

  // Otimização do processamento em lote
  const processBatchQueue = useCallback(async () => {
    if (batchQueueRef.current.length === 0) return;

    setIsLoading(true);
    const currentBatch = [...batchQueueRef.current];
    batchQueueRef.current = [];

    try {
      // Agrupamento otimizado por processo
      const processGroups = currentBatch.reduce((acc, item) => {
        if (!acc[item.processId]) {
          acc[item.processId] = new Set<string>();
        }
        acc[item.processId].add(item.sectorId);
        return acc;
      }, {} as ProcessSectorMap);

      // Dividir em sub-lotes se necessário para evitar queries muito grandes
      const batchPromises = Object.entries(processGroups).map(async ([processId, sectors]) => {
        const sectorArray = Array.from(sectors);
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
          .in('setor_id', sectorArray);

        if (error) throw error;
        return { processId, data };
      });

      const results = await Promise.all(batchPromises);

      // Atualização eficiente do cache e resolução de promessas
      results.forEach(({ processId, data }) => {
        if (!data) return;

        data.forEach((item) => {
          if (!item.usuarios) {
            console.warn(`Dados do usuário ausentes para setor ${item.setor_id} no processo ${processId}`);
            return;
          }

          const cacheKey = getCacheKey(processId, item.setor_id);
          const responsibleData = item.usuarios as ResponsibleData;
          
          // Atualizar cache
          cacheRef.current[cacheKey] = {
            timestamp: Date.now(),
            data: responsibleData
          };

          // Resolver promessas pendentes
          currentBatch
            .filter(q => q.processId === processId && q.sectorId === item.setor_id)
            .forEach(q => q.resolve(responsibleData));
        });
      });

      // Resolver promessas para itens não encontrados
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

  // Carregar responsável com otimização de cache
  const loadResponsible = useCallback((processId: string, sectorId: string): Promise<ResponsibleData | null> => {
    const cacheKey = getCacheKey(processId, sectorId);
    const cached = cacheRef.current[cacheKey];

    // Verificar cache válido
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      return Promise.resolve(cached.data);
    }

    // Adicionar à fila de batch otimizada
    return new Promise((resolve, reject) => {
      batchQueueRef.current.push({ processId, sectorId, resolve, reject });

      // Atualizar mapa de processo-setor para otimização
      if (!processSectorMapRef.current[processId]) {
        processSectorMapRef.current[processId] = new Set();
      }
      processSectorMapRef.current[processId].add(sectorId);

      // Limpar timeout anterior se existir
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Processar imediatamente se atingir tamanho máximo do lote
      if (batchQueueRef.current.length >= MAX_BATCH_SIZE) {
        processBatchQueue();
      } else {
        // Caso contrário, agendar processamento
        timeoutRef.current = setTimeout(processBatchQueue, BATCH_DELAY);
      }
    });
  }, [processBatchQueue]);

  // Pré-carregar responsáveis com otimização
  const preloadResponsibles = useCallback(async (processes: Process[]) => {
    if (!processes.length) return;

    try {
      const processIds = processes.map(p => p.id);
      const { data: history, error } = await supabase
        .from('processos_historico')
        .select('processo_id, setor_id')
        .in('processo_id', processIds);

      if (error) {
        console.error('Erro ao buscar histórico para preload:', error);
        return;
      }

      // Agrupar por processo para otimizar carregamento
      const processGroups: ProcessSectorMap = {};
      history.forEach(({ processo_id, setor_id }) => {
        if (!processGroups[processo_id]) {
          processGroups[processo_id] = new Set();
        }
        processGroups[processo_id].add(setor_id);
      });

      // Carregar em lotes menores para evitar sobrecarga
      const batchSize = Math.ceil(Object.keys(processGroups).length / 3);
      const processEntries = Object.entries(processGroups);
      
      for (let i = 0; i < processEntries.length; i += batchSize) {
        const batch = processEntries.slice(i, i + batchSize);
        const loadPromises = batch.flatMap(([processId, sectors]) => 
          Array.from(sectors).map(sectorId => loadResponsible(processId, sectorId))
        );
        await Promise.all(loadPromises);
      }
    } catch (error) {
      console.error('Erro no preload de responsáveis:', error);
    }
  }, [loadResponsible]);

  // Limpeza e manutenção do cache
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

