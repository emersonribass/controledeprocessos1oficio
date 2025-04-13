import { Process } from "@/types";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";
import { useProcesses } from "@/hooks/useProcesses";
import { useAuth } from "@/hooks/auth";

export const useProcessFilters = (processes: Process[]) => {
  const { isUserResponsibleForProcess } = useProcesses();
  const { user } = useAuth();
  
  return useProcessFiltering(processes, {
    isUserResponsibleForProcess,
    isUserResponsibleForSector: (process: Process, userId: string) => {
      if (!user || !user.departments || !user.departments.length) return false;
      return user.departments.includes(process.currentDepartment);
    }
  });
};