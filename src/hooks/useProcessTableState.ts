
import { useState, useCallback, useEffect, useMemo } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client"; //Hook para gerenciar o estado da tabela de processos

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  
  // Memorizar os IDs dos processos para evitar recálculos desnecessários
  const processIds = useMemo(() => 
    processes.map(p => p.id),
    [processes]
  );

  // Buscar responsáveis para todos os processos visíveis
  const fetchResponsibles = useCallback(async () => {
    if (!processIds.length) return;
    
    setIsLoading(true);
    try {
      // Buscar todos os responsáveis de setor em uma única consulta
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .in('processo_id', processIds);
      
      if (error) {
        console.error("Erro ao buscar responsáveis:", error);
        return;
      }
      
      // Organizar os dados por processo e setor para acesso rápido
      const responsiblesMap: Record<string, Record<string, any>> = {};
      
      if (data) {
        data.forEach(resp => {
          if (!responsiblesMap[resp.processo_id]) {
            responsiblesMap[resp.processo_id] = {};
          }
          responsiblesMap[resp.processo_id][resp.setor_id] = resp;
        });
      }
      
      setProcessesResponsibles(responsiblesMap);
    } catch (error) {
      console.error("Erro ao processar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processIds]);
  
  // Verificar se um processo tem responsável em um setor específico
  const hasResponsibleInSector = useCallback((processId: string, sectorId: string): boolean => {
    return !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][sectorId]
    );
  }, [processesResponsibles]);
  
  // Buscar responsáveis quando a lista de processos mudar
  useEffect(() => {
    if (processIds.length > 0) {
      fetchResponsibles();
    }
  }, [fetchResponsibles, processIds]);

  return {
    processesResponsibles,
    isLoading,
    fetchResponsibles,
    hasResponsibleInSector
  };
};
