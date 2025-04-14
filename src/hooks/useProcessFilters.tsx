
import { Process } from "@/types";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";
import { useProcesses } from "@/hooks/useProcesses";

export const useProcessFilters = (processes: Process[]) => {
  const { isUserResponsibleForProcess } = useProcesses();
  
  // Usar o hook useProcessFiltering com as funções de verificação de responsabilidade
  return useProcessFiltering(processes, {
    isUserResponsibleForProcess // A função isUserResponsibleForSector virá do useUserProfile interno
  });
};
