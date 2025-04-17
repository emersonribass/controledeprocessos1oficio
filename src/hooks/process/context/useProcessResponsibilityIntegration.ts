
import { Process } from "@/types";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";

/**
 * Hook para integrar as funcionalidades de responsabilidade e filtragem de processos
 */
export const useProcessResponsibilityIntegration = (processes: Process[]) => {
  // Reaproveitamos o hook useProcessFiltering para todas as funcionalidades relacionadas
  const {
    filterProcesses,
    isProcessOverdue,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible
  } = useProcessFiltering(processes);
  
  return {
    filterProcesses,
    isProcessOverdue,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible
  };
};
