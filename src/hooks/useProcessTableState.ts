
import { useState, useCallback, useEffect, useMemo } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, Record<string, any>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();
  
  // Memorizar os IDs dos processos para evitar recálculos desnecessários
  const processIds = useMemo(() => 
    processes.map(p => p.id),
    [processes]
  );

  // Buscar responsáveis para todos os processos visíveis
  const fetchResponsibles = useCallback(async () => {
    if (!processIds.length || !user) return;
    
    setIsLoading(true);
    try {
      console.log(`Buscando responsáveis para ${processIds.length} processos`);
      
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
          console.log(`Responsável encontrado para processo ${resp.processo_id}, setor ${resp.setor_id}: ${resp.usuario_id}`);
        });
      }
      
      setProcessesResponsibles(responsiblesMap);
      console.log(`Responsáveis carregados para ${Object.keys(responsiblesMap).length} processos`);
    } catch (error) {
      console.error("Erro ao processar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processIds, user]);
  
  // Verificar se um processo tem responsável em um setor específico
  const hasResponsibleInSector = useCallback((processId: string, sectorId: string): boolean => {
    const hasResponsible = !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][sectorId]
    );
    
    console.log(`Buscando responsável para o processo no setor: ${processId} ${sectorId}`);
    if (!hasResponsible) {
      console.log("Nenhum responsável encontrado para este setor");
    }
    
    return hasResponsible;
  }, [processesResponsibles]);
  
  // Verificar se o usuário atual é responsável por um processo em um setor específico
  const isUserResponsibleForSector = useCallback((processId: string, sectorId: string, userId: string): boolean => {
    if (!processesResponsibles[processId] || !processesResponsibles[processId][sectorId]) {
      return false;
    }
    
    const isResponsible = processesResponsibles[processId][sectorId].usuario_id === userId;
    console.log(`Verificando se usuário ${userId} é responsável por ${processId} no setor ${sectorId}: ${isResponsible}`);
    
    return isResponsible;
  }, [processesResponsibles]);
  
  // Buscar responsáveis quando a lista de processos mudar
  useEffect(() => {
    if (processIds.length > 0 && user) {
      fetchResponsibles();
    }
  }, [fetchResponsibles, processIds, user]);
  
  // Adicionar setor à fila para carregamento (para carregamento sob demanda)
  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    console.log(`Adicionando setor ${sectorId} à fila para carregamento para processo ${processId}`);
    // Implementação simples: apenas recarrega todos os responsáveis
    fetchResponsibles();
  }, [fetchResponsibles]);

  return {
    processesResponsibles,
    isLoading,
    fetchResponsibles,
    hasResponsibleInSector,
    isUserResponsibleForSector,
    queueSectorForLoading
  };
};
