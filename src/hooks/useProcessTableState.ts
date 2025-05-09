
import { useState, useCallback, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessTableState");

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  logger.debug(`useProcessTableState recebeu ${processes?.length || 0} processos`);

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

      if (processError) {
        logger.error("Erro ao buscar responsáveis iniciais:", processError);
        throw processError;
      }
      
      logger.debug(`Responsáveis iniciais encontrados: ${processResponsibles?.length || 0}`);
      
      // Log detalhado dos responsáveis iniciais
      if (processResponsibles && processResponsibles.length > 0) {
        const responsivesSample = processResponsibles.slice(0, 3);
        for (const resp of responsivesSample) {
          logger.debug(`Responsável inicial para processo ${resp.id}:`, 
            resp.usuarios ? `${resp.usuarios.nome} (${resp.usuarios.email})` : "Nenhum");
        }
      }

      // Buscar histórico dos processos para identificar setores que já receberam o processo
      const { data: processHistory, error: historyError } = await supabase
        .from('processos_historico')
        .select('processo_id, setor_id')
        .in('processo_id', startedProcessIds);

      if (historyError) {
        logger.error("Erro ao buscar histórico de processos:", historyError);
        throw historyError;
      }
      
      logger.debug(`Histórico de processos encontrados: ${processHistory?.length || 0} registros`);

      // Criar mapa de setores por processo que já receberam o processo
      const processToSectorsMap: Record<string, Set<string>> = {};
      processHistory.forEach(history => {
        if (!processToSectorsMap[history.processo_id]) {
          processToSectorsMap[history.processo_id] = new Set();
        }
        processToSectorsMap[history.processo_id].add(history.setor_id);
      });
      
      // Log detalhado do mapa de setores
      for (const [processId, sectors] of Object.entries(processToSectorsMap)) {
        logger.debug(`Processo ${processId} passou por ${sectors.size} setores: ${Array.from(sectors).join(', ')}`);
      }

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

      if (sectorError) {
        logger.error("Erro ao buscar responsáveis de setor:", sectorError);
        throw sectorError;
      }
      
      logger.debug(`Total de responsáveis de setor encontrados: ${allSectorResponsibles?.length || 0}`);
      
      if (allSectorResponsibles?.length === 0) {
        logger.warn('NENHUM RESPONSÁVEL DE SETOR ENCONTRADO NA CONSULTA!');
      } else {
        logger.info(`Encontrados ${allSectorResponsibles.length} responsáveis de setor no total`);
        
        // Log detalhado dos primeiros responsáveis de setor
        const sampleResponsibles = allSectorResponsibles.slice(0, 5);
        for (const resp of sampleResponsibles) {
          logger.debug(`Responsável para processo ${resp.processo_id}, setor ${resp.setor_id}: ${resp.usuarios?.nome || 'Desconhecido'}`);
        }
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
          logger.debug(`Mapeando responsável inicial para processo ${process.id}:`, process.usuarios.nome);
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
          logger.debug(`Mapeando responsável para processo ${processId}, setor ${sectorId}:`, resp.usuarios.nome);
          responsiblesMap[processId][sectorId] = resp.usuarios;
        } else {
          logger.warn(`Dados incompletos para processo ${processId}, setor ${resp.setor_id}`);
        }
      });

      // Log de todos os responsáveis carregados
      logger.info(`Responsáveis carregados por processo: ${Object.keys(responsiblesMap).length} processos com responsáveis`);
      
      // Log detalhado da estrutura montada para alguns processos
      const sampleProcessIds = Object.keys(responsiblesMap).slice(0, 3);
      for (const processId of sampleProcessIds) {
        const setores = Object.keys(responsiblesMap[processId]).filter(k => k !== 'initial');
        logger.debug(
          `Processo ${processId}: ${setores.length} setores com responsáveis - ` +
          `Setores: ${setores.join(', ')}`
        );
      }
      
      setProcessesResponsibles(responsiblesMap);
    } catch (error) {
      logger.error("Erro ao buscar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processes]);

  useEffect(() => {
    logger.debug("Efeito fetchResponsibles disparado");
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
