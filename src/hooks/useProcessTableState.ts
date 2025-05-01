
import { useState, useEffect, useCallback, useMemo } from "react";
import { Process } from "@/types";

/**
 * Hook otimizado para gerenciar estado da tabela de processos
 * Reutiliza os responsáveis já carregados no processo em vez de fazer novas requisições
 */
export const useProcessTableState = (processes: Process[]) => {
  const [isLoading, setIsLoading] = useState(false);

  // Extrair os responsáveis que já foram carregados ao buscar os processos
  // e organizá-los no formato esperado
  const processesResponsibles = useMemo(() => {
    const result: Record<string, Record<string, any>> = {};
    
    processes.forEach(process => {
      // Se o processo tem responsáveis já carregados, aproveitá-los
      if (process.responsibles) {
        result[process.id] = process.responsibles;
      } else {
        result[process.id] = {};
      }
      
      // Adicionar responsável inicial do processo se existir
      if (process.responsibleUserId) {
        result[process.id].initial = process.responsibleUserId;
      }
    });
    
    return result;
  }, [processes]);

  // Função simplificada que agora apenas marca para recarregar os dados no próximo ciclo,
  // em vez de fazer novas requisições ao banco de dados
  // Atualizado para retornar uma Promise
  const queueSectorForLoading = useCallback(async (processId: string, sectorId: string): Promise<void> => {
    console.log(`Setores e responsáveis serão atualizados na próxima atualização dos processos`);
    return Promise.resolve();
  }, []);

  return {
    processesResponsibles,
    isLoading,
    queueSectorForLoading
  };
};
