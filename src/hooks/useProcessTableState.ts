
import { useState, useEffect } from "react";
import { Process } from "@/types";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessTableState = (processes: Process[]) => {
  // Estado para armazenar os responsáveis de cada processo
  const [processesResponsibles, setProcessesResponsibles] = useState<Record<string, any>>({});
  const [loadingResponsibles, setLoadingResponsibles] = useState<Record<string, boolean>>({});
  const { getSectorResponsible } = useProcessResponsibility();

  // Função para carregar os responsáveis de todos os processos
  useEffect(() => {
    const loadAllResponsibles = async () => {
      const newLoadingState: Record<string, boolean> = {};
      
      for (const process of processes) {
        if (process.currentDepartment) {
          newLoadingState[process.id] = true;
        }
      }
      
      setLoadingResponsibles(newLoadingState);
      
      const newResponsibles: Record<string, any> = {};
      
      for (const process of processes) {
        if (process.currentDepartment) {
          try {
            const responsible = await getSectorResponsible(process.id, process.currentDepartment);
            newResponsibles[process.id] = responsible;
          } catch (error) {
            console.error(`Erro ao carregar responsável para processo ${process.id}:`, error);
          } finally {
            setLoadingResponsibles(prev => ({...prev, [process.id]: false}));
          }
        }
      }
      
      setProcessesResponsibles(newResponsibles);
    };
    
    loadAllResponsibles();
  }, [processes, getSectorResponsible]);

  return {
    processesResponsibles,
    loadingResponsibles
  };
};
