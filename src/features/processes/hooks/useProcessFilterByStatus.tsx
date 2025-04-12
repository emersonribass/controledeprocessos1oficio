
import { PROCESS_STATUS, ProcessStatus, Process } from "@/types";

interface FilterByStatusProps {
  status?: string;
  showCompleted?: boolean;
}

/**
 * Hook especializado para filtrar processos por status
 */
export const useProcessFilterByStatus = () => {
  
  /**
   * Filtra processos pelo status
   */
  const filterByStatus = (
    processes: Process[], 
    { status, showCompleted = true }: FilterByStatusProps
  ): Process[] => {
    return processes.filter(process => {
      // Ocultar processos concluídos se showCompleted for false
      if (showCompleted === false && process.status === PROCESS_STATUS.COMPLETED) {
        return false;
      }

      // Verificar filtro de status específico
      if (status) {
        // Converter os valores da UI para o formato usado no tipo Process
        let statusToMatch: ProcessStatus | string = status;
        
        // Mapear os valores da UI para os valores internos do tipo Process
        if (status === "pending") {
          statusToMatch = PROCESS_STATUS.PENDING;
        } else if (status === "completed") {
          statusToMatch = PROCESS_STATUS.COMPLETED;
        } else if (status === "overdue") {
          statusToMatch = PROCESS_STATUS.OVERDUE;
        } else if (status === "not_started") {
          statusToMatch = PROCESS_STATUS.NOT_STARTED;
        }
        
        // Garantir que o status corresponda exatamente ao solicitado
        if (process.status !== statusToMatch) {
          return false;
        }
      }

      return true;
    });
  };

  return { filterByStatus };
};
