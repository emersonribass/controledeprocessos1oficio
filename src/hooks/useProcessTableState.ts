
import { useState, useEffect, useCallback, useRef } from 'react';
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";

interface ProcessTableState {
  processesResponsibles: Record<string, Record<string, any>>;
  isLoading: boolean;
  queueSectorForLoading: (processId: string, sectorId: string) => void;
}

export const useProcessTableState = (processes: Process[]): ProcessTableState => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const processingRef = useRef(false);

  const queue = useRef<Array<{ processId: string; sectorId: string }>>([]);

  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    queue.current.push({ processId, sectorId });
    if (!processingRef.current) {
      checkResponsibles();
    }
  }, []);

  const checkResponsibles = useCallback(async () => {
    if (processingRef.current || queue.current.length === 0) return;
    
    processingRef.current = true;
    setIsLoading(true);

    const sectorsToCheck: Record<string, Set<string>> = {};

    while (queue.current.length > 0) {
      const { processId, sectorId } = queue.current.shift()!;
      if (!sectorsToCheck[processId]) {
        sectorsToCheck[processId] = new Set();
      }
      sectorsToCheck[processId].add(sectorId);
    }

    try {
      const { data: responsibleData, error } = await supabase
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
        .in('processo_id', Object.keys(sectorsToCheck));

      if (error) throw error;

      const newResponsibles: Record<string, Record<string, any>> = { ...processesResponsibles };

      if (responsibleData) {
        responsibleData.forEach(item => {
          if (!newResponsibles[item.processo_id]) {
            newResponsibles[item.processo_id] = {};
          }
          newResponsibles[item.processo_id][item.setor_id] = item.usuarios;
        });
      }

      setProcessesResponsibles(newResponsibles);
    } catch (error) {
      console.error('Erro ao verificar responsáveis:', error);
    } finally {
      setIsLoading(false);
      processingRef.current = false;
      
      // Verificar se novos itens foram adicionados à fila durante o processamento
      if (queue.current.length > 0) {
        setTimeout(checkResponsibles, 100);
      }
    }
  }, [processesResponsibles]);

  // Função para carregar inicialmente os responsáveis para todos os processos
  const loadInitialResponsibles = useCallback(async () => {
    if (!processes || processes.length === 0 || processingRef.current) return;
    
    setIsLoading(true);
    processingRef.current = true;
    
    try {
      // Preparar a lista de todos os processos e seus setores atuais
      const processesWithSectors = processes.filter(p => p.currentDepartment).map(p => ({
        processId: p.id,
        sectorId: p.currentDepartment
      }));
      
      // Adicionar todos à fila
      processesWithSectors.forEach(({ processId, sectorId }) => {
        queue.current.push({ processId, sectorId });
      });
      
      // Processar a fila
      await checkResponsibles();
    } catch (error) {
      console.error('Erro ao carregar responsáveis iniciais:', error);
    } finally {
      setIsLoading(false);
      processingRef.current = false;
    }
  }, [processes, checkResponsibles]);

  useEffect(() => {
    loadInitialResponsibles();
  }, [loadInitialResponsibles]);

  return {
    processesResponsibles,
    isLoading,
    queueSectorForLoading
  };
};
