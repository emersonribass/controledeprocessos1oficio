
import { useState, useCallback, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchResponsibles = useCallback(async () => {
    if (!processes.length) return;

    setIsLoading(true);
    try {
      // Filtrar apenas os processos iniciados
      const startedProcessIds = processes
        .filter(p => p.status !== 'not_started')
        .map(p => p.id);

      if (startedProcessIds.length === 0) {
        setIsLoading(false);
        return;
      }

      // Buscar responsáveis iniciais dos processos com dados do usuário
      const { data: processResponsibles, error: processError } = await supabase
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
        .in('id', startedProcessIds);

      if (processError) throw processError;

      // Buscar histórico dos processos para identificar setores que já receberam o processo
      const { data: processHistory, error: historyError } = await supabase
        .from('processos_historico')
        .select('processo_id, setor_id')
        .in('processo_id', startedProcessIds);

      if (historyError) throw historyError;

      // Criar mapa de setores por processo que já receberam o processo
      const processToSectorsMap: Record<string, Set<string>> = {};
      processHistory.forEach(history => {
        if (!processToSectorsMap[history.processo_id]) {
          processToSectorsMap[history.processo_id] = new Set();
        }
        processToSectorsMap[history.processo_id].add(history.setor_id);
      });

      // Buscar responsáveis apenas para os setores que já receberam o processo
      const sectorResponsiblesPromises = startedProcessIds.map(async (processId) => {
        const sectors = processToSectorsMap[processId];
        if (!sectors || sectors.size === 0) return null;

        // Buscar todos os responsáveis por setor de uma vez
        const { data: sectorResponsibles, error: sectorError } = await supabase
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
          .eq('processo_id', processId)
          .in('setor_id', Array.from(sectors));

        if (sectorError) {
          console.error("Erro ao buscar responsáveis de setor:", sectorError);
          throw sectorError;
        }
        
        return sectorResponsibles;
      });

      const sectorResponsiblesResults = await Promise.all(
        sectorResponsiblesPromises.filter(Boolean)
      );

      // Organizar os dados em uma estrutura adequada
      const responsiblesMap: Record<string, Record<string, any>> = {};

      // Mapear responsáveis iniciais
      processResponsibles?.forEach(process => {
        if (!responsiblesMap[process.id]) {
          responsiblesMap[process.id] = {};
        }
        // Armazenar o responsável inicial do processo
        if (process.usuarios) {
          responsiblesMap[process.id].initial = process.usuarios;
        }
      });

      // Mapear responsáveis por setor
      sectorResponsiblesResults.flat().forEach(resp => {
        if (!resp) return;
        
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

      // Log de todos os responsáveis carregados
      console.log("Responsáveis carregados:", responsiblesMap);
      
      setProcessesResponsibles(responsiblesMap);
    } catch (error) {
      console.error("Erro ao buscar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processes]);

  useEffect(() => {
    fetchResponsibles();
  }, [fetchResponsibles]);

  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    // Recarregar os responsáveis quando necessário
    console.log(`Recarregando responsáveis para processo ${processId}, setor ${sectorId}`);
    setTimeout(() => {
      fetchResponsibles();
    }, 500); // Pequeno delay para garantir que os dados estejam atualizados no banco
  }, [fetchResponsibles]);

  return {
    processesResponsibles,
    isLoading,
    fetchResponsibles,
    queueSectorForLoading
  };
};
