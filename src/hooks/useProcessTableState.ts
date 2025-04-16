
import { useState, useCallback, useEffect } from "react";
import { Process } from "@/types";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  const [sectorsToLoad, setSectorsToLoad] = useState<Array<{ processId: string, sectorId: string }>>([]);
  const { getSectorResponsible, isUserResponsibleForSector } = useProcessResponsibility();

  // Marcar um setor para carregamento
  const queueSectorForLoading = useCallback((processId: string, sectorId: string) => {
    setSectorsToLoad(prev => [...prev, { processId, sectorId }]);
  }, []);

  // Verificar se há um responsável para o setor
  const hasResponsibleInSector = useCallback((processId: string, sectorId: string) => {
    return !!(
      processesResponsibles[processId] && 
      processesResponsibles[processId][sectorId]
    );
  }, [processesResponsibles]);

  // Buscar responsáveis para processos
  const fetchResponsibles = useCallback(async () => {
    if (processes.length === 0) return;
    
    console.log(`Buscando responsáveis para ${processes.length} processos`);
    
    const newResponsibles: Record<string, any> = { ...processesResponsibles };
    let responsiblesCount = 0;
    
    for (const process of processes) {
      if (!newResponsibles[process.id]) {
        newResponsibles[process.id] = {};
      }
      
      const sectorId = process.currentDepartment;
      
      // Pular se já temos essa informação
      if (newResponsibles[process.id][sectorId]) continue;
      
      try {
        const responsible = await getSectorResponsible(process.id, sectorId);
        
        if (responsible) {
          newResponsibles[process.id][sectorId] = responsible;
          console.log(`Responsável encontrado para processo ${process.id}, setor ${sectorId}: ${responsible.id}`);
          responsiblesCount++;
        }
      } catch (error) {
        console.error(`Erro ao buscar responsável para processo ${process.id}, setor ${sectorId}:`, error);
      }
    }
    
    // Processar setores adicionais na fila
    if (sectorsToLoad.length > 0) {
      for (const { processId, sectorId } of sectorsToLoad) {
        // Inicializar processo se necessário
        if (!newResponsibles[processId]) {
          newResponsibles[processId] = {};
        }
        
        // Buscar responsável apenas se ainda não temos
        if (!newResponsibles[processId][sectorId]) {
          try {
            const responsible = await getSectorResponsible(processId, sectorId);
            
            if (responsible) {
              newResponsibles[processId][sectorId] = responsible;
              responsiblesCount++;
            }
          } catch (error) {
            console.error(`Erro ao buscar responsável para processo ${processId}, setor ${sectorId}:`, error);
          }
        }
      }
      
      // Limpar fila após processamento
      setSectorsToLoad([]);
    }
    
    console.log(`Responsáveis carregados para ${responsiblesCount} processos`);
    setProcessesResponsibles(newResponsibles);
  }, [processes, processesResponsibles, getSectorResponsible, sectorsToLoad]);

  // Efeito para carregar responsáveis quando a lista de setores a carregar muda
  useEffect(() => {
    if (sectorsToLoad.length > 0) {
      fetchResponsibles();
    }
  }, [sectorsToLoad, fetchResponsibles]);

  return {
    processesResponsibles,
    fetchResponsibles,
    hasResponsibleInSector,
    isUserResponsibleForSector,
    queueSectorForLoading
  };
};
