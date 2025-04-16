
import { useCallback, useRef, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";

/**
 * Hook especializado para carregar responsáveis em lote com controle de chamadas
 * Evita consultas duplicadas e implementa throttling
 */
export const useResponsibleBatchLoader = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [responsiblesData, setResponsiblesData] = useState<Record<string, Record<string, any>>>({});
  
  // Controle de carregamento
  const loadingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastLoadTimeRef = useRef<number>(0);
  const pendingProcessesRef = useRef<Set<string>>(new Set());
  const processStatusCacheRef = useRef<Map<string, string>>(new Map());
  
  // Tempo mínimo entre carregamentos (milliseconds)
  const THROTTLE_TIME = 2000;
  
  /**
   * Verifica se um processo específico está pronto para ser carregado
   */
  const canLoadProcess = useCallback((processId: string, status?: string): boolean => {
    // Não carregar se não há usuário autenticado
    if (!user) return false;
    
    // Armazenar status do processo no cache
    if (status) {
      processStatusCacheRef.current.set(processId, status);
    }
    
    // Não carregar processos não iniciados
    const cachedStatus = processStatusCacheRef.current.get(processId);
    if (cachedStatus === 'not_started') return false;
    
    return true;
  }, [user]);
  
  /**
   * Agenda carregamento de responsáveis em lote com throttling
   */
  const scheduleLoad = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
    }
    
    const now = Date.now();
    const timeSinceLastLoad = now - lastLoadTimeRef.current;
    
    // Definir o delay com base no tempo desde o último carregamento
    const delay = timeSinceLastLoad < THROTTLE_TIME 
      ? THROTTLE_TIME - timeSinceLastLoad
      : 0;
      
    loadingTimerRef.current = setTimeout(executeLoad, delay);
  }, []);
  
  /**
   * Executa o carregamento efetivo dos responsáveis
   */
  const executeLoad = useCallback(async () => {
    if (pendingProcessesRef.current.size === 0 || !user || isLoading) {
      return;
    }
    
    setIsLoading(true);
    lastLoadTimeRef.current = Date.now();
    
    try {
      // Filtrar apenas processos que realmente precisam ser carregados
      const processesToLoad = Array.from(pendingProcessesRef.current).filter(
        processId => {
          const status = processStatusCacheRef.current.get(processId);
          return status !== 'not_started';
        }
      );
      
      if (processesToLoad.length === 0) {
        console.log("Nenhum processo precisa ser carregado após filtragem de status");
        pendingProcessesRef.current.clear();
        return;
      }
      
      console.log(`Executando carregamento em lote para ${processesToLoad.length} processos`);
      
      // Buscar responsáveis no banco de dados
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('processo_id, setor_id, usuario_id')
        .in('processo_id', processesToLoad);
      
      if (error) {
        console.error("Erro ao buscar responsáveis em lote:", error);
        return;
      }
      
      // Processar os resultados
      const results: Record<string, Record<string, any>> = {};
      
      data.forEach(item => {
        if (!results[item.processo_id]) {
          results[item.processo_id] = {};
        }
        
        results[item.processo_id][item.setor_id] = { 
          usuario_id: item.usuario_id 
        };
      });
      
      // Atualizar estado com os novos dados
      setResponsiblesData(prev => ({
        ...prev,
        ...results
      }));
      
      console.log(`Responsáveis carregados para ${Object.keys(results).length} processos`);
      
      // Limpar processos pendentes que foram carregados
      processesToLoad.forEach(id => {
        pendingProcessesRef.current.delete(id);
      });
    } catch (err) {
      console.error("Erro durante carregamento de responsáveis:", err);
    } finally {
      setIsLoading(false);
    }
  }, [user, isLoading]);
  
  /**
   * Adiciona um processo à fila para carregamento de responsáveis
   */
  const queueProcessForLoading = useCallback((processId: string, status?: string) => {
    if (!canLoadProcess(processId, status)) {
      return false;
    }
    
    // Se o processo já está na fila, não fazer nada
    if (pendingProcessesRef.current.has(processId)) {
      return true;
    }
    
    // Adicionar à fila de pendentes
    pendingProcessesRef.current.add(processId);
    
    // Agendar carregamento
    scheduleLoad();
    return true;
  }, [canLoadProcess, scheduleLoad]);
  
  /**
   * Adiciona múltiplos processos à fila de carregamento
   */
  const queueMultipleProcesses = useCallback((processes: Process[]) => {
    let added = 0;
    
    processes.forEach(process => {
      const wasAdded = queueProcessForLoading(process.id, process.status);
      if (wasAdded) added++;
    });
    
    return added;
  }, [queueProcessForLoading]);
  
  /**
   * Limpa a fila e cancela carregamentos pendentes
   */
  const cancelPendingLoads = useCallback(() => {
    if (loadingTimerRef.current) {
      clearTimeout(loadingTimerRef.current);
      loadingTimerRef.current = null;
    }
    
    pendingProcessesRef.current.clear();
  }, []);
  
  /**
   * Retorna os dados de responsável para um processo/setor específico
   */
  const getResponsibleData = useCallback((processId: string, sectorId: string) => {
    return responsiblesData[processId]?.[sectorId] || null;
  }, [responsiblesData]);
  
  /**
   * Verifica se um processo tem um responsável designado para um setor específico
   */
  const hasResponsibleForSector = useCallback((processId: string, sectorId: string): boolean => {
    return !!getResponsibleData(processId, sectorId);
  }, [getResponsibleData]);
  
  /**
   * Verifica se o usuário atual é o responsável por um processo em um setor específico
   */
  const isUserResponsibleForSector = useCallback((processId: string, sectorId: string): boolean => {
    if (!user) return false;
    
    const responsible = getResponsibleData(processId, sectorId);
    return responsible?.usuario_id === user.id;
  }, [getResponsibleData, user]);
  
  // Limpar ao desmontar
  useEffect(() => {
    return () => {
      if (loadingTimerRef.current) {
        clearTimeout(loadingTimerRef.current);
      }
    };
  }, []);
  
  return {
    queueProcessForLoading,
    queueMultipleProcesses,
    cancelPendingLoads,
    isLoading,
    getResponsibleData,
    hasResponsibleForSector,
    isUserResponsibleForSector,
    responsiblesData
  };
};
