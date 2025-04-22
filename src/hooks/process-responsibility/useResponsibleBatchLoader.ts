
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/hooks/auth";
import { useResponsibleCache } from "./useResponsibleCache";
import { useResponsibleBatchQueue } from "./useResponsibleBatchQueue";
import { Process } from "@/types";

interface ResponsibleData {
  id: string;
  nome: string;
  email: string;
}

export const useResponsibleBatchLoader = () => {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const { getFromCache, setInCache, cleanExpiredCache } = useResponsibleCache();
  const { addToQueue } = useResponsibleBatchQueue();

  // Carregar responsável com otimização de cache
  const loadResponsible = useCallback((processId: string, sectorId: string): Promise<ResponsibleData | null> => {
    const cached = getFromCache(processId, sectorId);
    if (cached) {
      return Promise.resolve(cached);
    }

    return new Promise((resolve, reject) => {
      addToQueue(
        processId,
        sectorId,
        (data) => {
          if (data) {
            setInCache(processId, sectorId, data);
          }
          resolve(data);
        },
        reject
      );
    });
  }, [getFromCache, setInCache, addToQueue]);

  // Função otimizada para pré-carregar responsáveis
  const preloadResponsibles = useCallback(async (processes: Process[]) => {
    if (!processes.length) return;

    setIsLoading(true);
    try {
      const loadPromises = processes.map(process => 
        process.currentDepartment ? 
          loadResponsible(process.id, process.currentDepartment) : 
          Promise.resolve(null)
      );

      await Promise.all(loadPromises);
    } catch (error) {
      console.error('Erro no preload de responsáveis:', error);
    } finally {
      setIsLoading(false);
    }
  }, [loadResponsible]);

  // Limpeza periódica do cache
  useEffect(() => {
    const interval = setInterval(cleanExpiredCache, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [cleanExpiredCache]);

  return {
    loadResponsible,
    preloadResponsibles,
    isLoading
  };
};

