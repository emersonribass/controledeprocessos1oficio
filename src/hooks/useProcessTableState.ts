
import { useState, useCallback, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessTableState");

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchResponsibles = useCallback(async () => {
    if (!processes.length) return;

    setIsLoading(true);
    logger.debug(`Buscando responsáveis para ${processes.length} processos`);
    
    try {
      // Filtrar apenas os processos iniciados
      const startedProcessIds = processes
        .filter(p => p.status !== 'not_started')
        .map(p => p.id);

      // Log específico para o processo 118766
      if (startedProcessIds.includes('118766')) {
        logger.debug("Processo 118766 está incluído na busca de responsáveis");
      }

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

      // Log específico para verificar setores do processo 118766
      if (processToSectorsMap['118766']) {
        logger.debug(`Processo 118766 tem histórico nos setores: ${Array.from(processToSectorsMap['118766']).join(', ')}`);
      }

      // Buscar TODOS os responsáveis por setor de uma vez só
      const { data: allSectorResponsibles, error: sectorError } = await supabase
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
        .in('processo_id', startedProcessIds);
        
      if (sectorError) {
        logger.error("Erro ao buscar responsáveis de setor:", sectorError);
        throw sectorError;
      }
      
      // Log para verificar responsáveis do processo 118766
      const process118766Responsibles = allSectorResponsibles?.filter(resp => resp.processo_id === '118766');
      if (process118766Responsibles?.length) {
        logger.debug(`Encontrados ${process118766Responsibles.length} responsáveis para o processo 118766`);
        process118766Responsibles.forEach(resp => {
          logger.debug(`Setor ${resp.setor_id}, Usuário: ${resp.usuarios?.nome || 'Sem nome'}`);
        });
      } else {
        logger.debug("Nenhum responsável encontrado para o processo 118766");
      }

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
      allSectorResponsibles?.forEach(resp => {
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

      // Log específico para verificar mapeamento final do processo 118766
      if (responsiblesMap['118766']) {
        logger.debug("Mapeamento final de responsáveis para processo 118766:");
        logger.debug(JSON.stringify(responsiblesMap['118766']));
      }
      
      setProcessesResponsibles(responsiblesMap);
    } catch (error) {
      logger.error("Erro ao buscar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processes]);

  useEffect(() => {
    fetchResponsibles();
  }, [fetchResponsibles]);

  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    // Recarregar os responsáveis quando necessário
    logger.debug(`Recarregando responsáveis para processo ${processId}, setor ${sectorId}`);
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
