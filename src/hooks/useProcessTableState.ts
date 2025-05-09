
import { useState, useCallback, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessTableState");

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);

  const fetchResponsibles = useCallback(async () => {
    if (!processes.length) {
      logger.info("Nenhum processo para buscar responsáveis");
      return;
    }

    setIsLoading(true);
    try {
      // Filtrar apenas os processos iniciados
      const startedProcessIds = processes
        .filter(p => p.status !== 'not_started')
        .map(p => p.id);

      if (startedProcessIds.length === 0) {
        logger.info("Nenhum processo iniciado para buscar responsáveis");
        setIsLoading(false);
        return;
      }

      logger.info(`Buscando responsáveis para ${startedProcessIds.length} processos:`, startedProcessIds);

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
      logger.debug('Responsáveis iniciais encontrados:', processResponsibles?.length);
      logger.debug('Detalhe dos responsáveis iniciais:', JSON.stringify(processResponsibles));

      // Buscar histórico dos processos para identificar setores que já receberam o processo
      const { data: processHistory, error: historyError } = await supabase
        .from('processos_historico')
        .select('processo_id, setor_id')
        .in('processo_id', startedProcessIds);

      if (historyError) throw historyError;
      logger.debug('Histórico de processos encontrados:', processHistory?.length);

      // Criar mapa de setores por processo que já receberam o processo
      const processToSectorsMap: Record<string, Set<string>> = {};
      processHistory.forEach(history => {
        if (!processToSectorsMap[history.processo_id]) {
          processToSectorsMap[history.processo_id] = new Set();
        }
        processToSectorsMap[history.processo_id].add(history.setor_id);
      });
      
      logger.debug('Mapa de setores por processo:', JSON.stringify(Object.fromEntries(
        Object.entries(processToSectorsMap).map(([k, v]) => [k, Array.from(v)])
      )));

      // Buscar todos os responsáveis de setores para todos os processos de uma vez
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

      if (sectorError) throw sectorError;
      
      logger.debug('Total de responsáveis de setor encontrados:', allSectorResponsibles?.length);
      if (allSectorResponsibles?.length === 0) {
        logger.warn('NENHUM RESPONSÁVEL DE SETOR ENCONTRADO NA CONSULTA!');
      } else {
        logger.debug('Amostra dos primeiros 3 responsáveis:', JSON.stringify(allSectorResponsibles.slice(0, 3)));
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
          logger.debug(`Responsável inicial para processo ${process.id}:`, process.usuarios);
          responsiblesMap[process.id].initial = process.usuarios;
        }
      });

      // Mapear responsáveis por setor
      allSectorResponsibles?.forEach(resp => {
        const processId = resp.processo_id;
        
        if (!responsiblesMap[processId]) {
          responsiblesMap[processId] = {};
        }
        
        // Garantir que temos os dados formatados corretamente
        if (resp.usuarios && resp.setor_id) {
          const sectorId = String(resp.setor_id);
          logger.debug(`Responsável para processo ${processId}, setor ${sectorId}:`, resp.usuarios);
          responsiblesMap[processId][sectorId] = resp.usuarios;
        }
      });

      // Log de todos os responsáveis carregados
      logger.info("Responsáveis carregados por processo:", 
        Object.keys(responsiblesMap).length, 
        "processos com responsáveis"
      );
      
      // Log detalhado da estrutura montada
      Object.keys(responsiblesMap).forEach(processId => {
        const setores = Object.keys(responsiblesMap[processId]).filter(k => k !== 'initial');
        logger.debug(
          `Processo ${processId}: ${setores.length} setores com responsáveis - ` +
          `Setores: ${setores.join(', ')}`
        );
      });
      
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
    logger.info(`Recarregando responsáveis para processo ${processId}, setor ${sectorId}`);
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
