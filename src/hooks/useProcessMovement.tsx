
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useNextDepartment } from "./process-movement/useNextDepartment";
import { usePreviousDepartment } from "./process-movement/usePreviousDepartment";

export const useProcessMovement = (processes: Process[]) => {
  const { departments } = useDepartmentsData();
  const { moveProcessToNextDepartment: moveToNext } = useNextDepartment(departments);
  const { moveProcessToPreviousDepartment: moveToPrevious } = usePreviousDepartment(departments);

  const moveProcessToNextDepartment = async (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return false;
    
    return await moveToNext(process);
  };

  const moveProcessToPreviousDepartment = async (processId: string) => {
    const process = processes.find(p => p.id === processId);
    if (!process) return false;
    
    return await moveToPrevious(process);
  };

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment
  };
};
