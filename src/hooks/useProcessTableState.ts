
import { useState, useCallback } from "react";
import { Process } from "@/types";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessTableState = (processes: Process[]) => {
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  const { getSectorResponsible } = useProcessResponsibility();
  
  // Função para buscar responsáveis de todos os processos
  const fetchResponsibles = useCallback(async () => {
    const newResponsibles: Record<string, any> = {};
    
    // Para cada processo, buscar o responsável do setor atual
    const promises = processes.map(async (process) => {
      try {
        if (process.currentDepartment) {
          const responsible = await getSectorResponsible(process.id, process.currentDepartment);
          if (responsible) {
            newResponsibles[process.id] = responsible;
          }
        }
      } catch (error) {
        console.error(`Erro ao buscar responsável para o processo ${process.id}:`, error);
      }
    });
    
    // Aguardar todas as consultas serem concluídas
    await Promise.all(promises);
    
    // Atualizar o estado com os responsáveis encontrados
    setProcessesResponsibles(newResponsibles);
  }, [processes, getSectorResponsible]);
  
  return {
    processesResponsibles,
    fetchResponsibles
  };
};
