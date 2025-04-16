
import { Process } from "@/types";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";

/**
 * Hook simplificado que utiliza o useProcessFiltering
 * Mantido para compatibilidade com código existente
 */
export const useProcessFilters = (processes: Process[]) => {
  // Agora não precisamos mais passar as funções de verificação aqui
  // pois useProcessFiltering já implementa a lógica otimizada
  return useProcessFiltering(processes);
};
