
import { Process } from "@/types";
import { useProcessFiltering } from "./process/useProcessFiltering";

/**
 * Hook para filtrar processos - mantido para compatibilidade com código existente
 * Simplesmente reencaminha para o novo hook useProcessFiltering
 */
export const useProcessFilters = (processes: Process[]) => {
  return useProcessFiltering(processes);
};
