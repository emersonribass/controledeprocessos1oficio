
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

      // Buscar responsáveis iniciais dos processos
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

      // Buscar responsáveis por setor
      const { data: sectorResponsibles, error: sectorError } = await supabase
        .from('setor_responsaveis')
        .select(`
          processo_id,
          setor_id,
          usuarios(
            id,
            nome,
            email
          )
        `)
        .in('processo_id', startedProcessIds);

      if (sectorError) throw sectorError;

      // Organizar os dados em uma estrutura adequada
      const responsiblesMap: Record<string, Record<string, any>> = {};

      // Mapear responsáveis iniciais
      processResponsibles?.forEach(process => {
        if (!responsiblesMap[process.id]) {
          responsiblesMap[process.id] = {};
        }
        responsiblesMap[process.id].initial = process.usuarios;
      });

      // Mapear responsáveis por setor
      sectorResponsibles?.forEach(resp => {
        if (!responsiblesMap[resp.processo_id]) {
          responsiblesMap[resp.processo_id] = {};
        }
        // Garantir que setor_id seja string para bater com dept.id (caso venha como número)
        const sectorId = String(resp.setor_id);
        responsiblesMap[resp.processo_id][resp.setor_id] = resp.usuarios;
      });
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
    // Recarregar os responsáveis
    fetchResponsibles();
  }, [fetchResponsibles]);

  return {
    processesResponsibles,
    isLoading,
    fetchResponsibles,
    queueSectorForLoading
  };
};
