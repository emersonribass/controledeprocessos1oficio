
import { Process } from "@/types";
import { useProcessFiltering } from "./process/useProcessFiltering";
import { useProcesses } from "./useProcesses";

/**
 * Hook para filtrar processos - mantido para compatibilidade com código existente
 * Simplesmente reencaminha para o novo hook useProcessFiltering
 */
export const useProcessFilters = (processes: Process[]) => {
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcesses();
  
  return useProcessFiltering(processes, {
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  });
};
