
import { useState, useCallback, useEffect, useRef } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const isFetchingRef = useRef(false);
  const lastProcessesHashRef = useRef("");

  // Gerar um hash simples dos IDs dos processos para comparação rápida
  const generateProcessesHash = useCallback((procs: Process[]): string => {
    return procs.map(p => p.id).sort().join(',');
  }, []);

  const fetchResponsibles = useCallback(async () => {
    if (!processes.length || isFetchingRef.current) return;

    // Verificar se os processos mudaram desde a última busca
    const currentHash = generateProcessesHash(processes);
    if (currentHash === lastProcessesHashRef.current) {
      console.log("Processos não mudaram, usando cache existente");
      return;
    }

    isFetchingRef.current = true;
    setIsLoading(true);
    
    try {
      lastProcessesHashRef.current = currentHash;
      
      // Filtrar apenas os processos iniciados
      const startedProcessIds = processes
        .filter(p => p.status !== 'not_started')
        .map(p => p.id);

      if (startedProcessIds.length === 0) {
        setIsLoading(false);
        isFetchingRef.current = false;
        return;
      }

      // Buscar todos os dados necessários em paralelo
      const [processResponsiblesResult, processHistoryResult] = await Promise.all([
        // Buscar responsáveis iniciais
        supabase
          .from('processos')
          .select(`
            id,
            usuario_responsavel,
            usuarios!processos_usuario_responsavel_fkey(
              id,
              nome,
              email
            )
          `)
          .in('id', startedProcessIds),
          
        // Buscar histórico dos processos
        supabase
          .from('processos_historico')
          .select('processo_id, setor_id')
          .in('processo_id', startedProcessIds)
      ]);

      if (processResponsiblesResult.error) throw processResponsiblesResult.error;
      if (processHistoryResult.error) throw processHistoryResult.error;

      const processResponsibles = processResponsiblesResult.data || [];
      const processHistory = processHistoryResult.data || [];

      // Criar mapa de setores por processo
      const processToSectorsMap: Record<string, Set<string>> = {};
      processHistory.forEach(history => {
        if (!processToSectorsMap[history.processo_id]) {
          processToSectorsMap[history.processo_id] = new Set();
        }
        processToSectorsMap[history.processo_id].add(history.setor_id);
      });

      // Preparar array de promessas para buscar responsáveis de setor em lote
      const sectorResponsiblesPromises: Promise<any>[] = [];
      
      // Agrupar consultas por lotes de processos para reduzir o número de consultas
      const processBatches: string[][] = [];
      const BATCH_SIZE = 5; // Tamanho do lote
      
      let currentBatch: string[] = [];
      startedProcessIds.forEach((id) => {
        currentBatch.push(id);
        if (currentBatch.length >= BATCH_SIZE) {
          processBatches.push([...currentBatch]);
          currentBatch = [];
        }
      });
      
      if (currentBatch.length > 0) {
        processBatches.push(currentBatch);
      }
      
      // Buscar responsáveis de setor por lotes
      processBatches.forEach((batch) => {
        sectorResponsiblesPromises.push(
          supabase
            .from('setor_responsaveis')
            .select(`
              processo_id,
              setor_id,
              usuario_id,
              usuarios:usuario_id(
                id,
                nome,
                email
              )
            `)
            .in('processo_id', batch)
        );
      });

      const sectorResponsiblesResults = await Promise.all(sectorResponsiblesPromises);

      // Organizar os dados em uma estrutura adequada
      const responsiblesMap: Record<string, Record<string, any>> = {};

      // Mapear responsáveis iniciais
      processResponsibles.forEach(process => {
        if (!responsiblesMap[process.id]) {
          responsiblesMap[process.id] = {};
        }
        // Armazenar o responsável inicial do processo
        if (process.usuarios) {
          responsiblesMap[process.id].initial = process.usuarios;
        }
      });

      // Mapear responsáveis por setor (concatenando resultados de todos os lotes)
      sectorResponsiblesResults.forEach(result => {
        if (result.error) {
          console.error("Erro ao buscar responsáveis de setor:", result.error);
          return;
        }
        
        (result.data || []).forEach(resp => {
          const processId = resp.processo_id;
          const sectorId = String(resp.setor_id);
          
          if (!responsiblesMap[processId]) {
            responsiblesMap[processId] = {};
          }
          
          // Garante que temos os dados formatados corretamente
          if (resp.usuarios) {
            responsiblesMap[processId][sectorId] = resp.usuarios;
          }
        });
      });
      
      console.log("Responsáveis carregados:", responsiblesMap);
      
      setProcessesResponsibles(responsiblesMap);
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
    } finally {
      setIsLoading(false);
      isFetchingRef.current = false;
    }
  }, [processes, generateProcessesHash]);

  useEffect(() => {
    fetchResponsibles();
    
    return () => {
      // Limpar referências na desmontagem
      isFetchingRef.current = false;
    };
  }, [fetchResponsibles]);

  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    // Forçar nova carga apenas para o setor específico
    console.log(`Recarregando responsáveis para processo ${processId}, setor ${sectorId}`);
    
    // Invalidar hash para forçar recarga na próxima vez
    lastProcessesHashRef.current = "";
    
    setTimeout(() => {
      fetchResponsibles();
    }, 500);
  }, [fetchResponsibles]);

  return {
    processesResponsibles,
    isLoading,
    fetchResponsibles,
    queueSectorForLoading
  };
};
