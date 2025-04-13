
import { Process } from "@/types";
import { useProcessFiltering } from "./process/useProcessFiltering";
import { useProcesses } from "./useProcesses";
import { useAuth } from "@/hooks/auth";

/**
 * Hook para filtrar processos - mantido para compatibilidade com código existente
 * Simplesmente reencaminha para o novo hook useProcessFiltering
 */
export const useProcessFilters = (processes: Process[]) => {
  const { isUserResponsibleForProcess, isUserResponsibleForSector } = useProcesses();
  const { user } = useAuth();
  
  return useProcessFiltering(processes, {
    isUserResponsibleForProcess,
    isUserResponsibleForSector: (process, userId) => {
      // Garantindo que a verificação de setor seja feita corretamente
      if (!user || !user.departments || !user.departments.length) return false;
      return user.departments.includes(process.currentDepartment);
    }
  });
};
