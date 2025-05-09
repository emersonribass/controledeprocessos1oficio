
import { Process } from "@/types";
import { useNextDepartment } from "./process-movement/useNextDepartment";
import { usePreviousDepartment } from "./process-movement/usePreviousDepartment";
import { useDepartmentsData } from "./useDepartmentsData";

export const useProcessMovement = (processes: Process[]) => {
  const { departments } = useDepartmentsData();
  const { moveProcessToNextDepartment: moveNext } = useNextDepartment(departments);
  const { moveProcessToPreviousDepartment: movePrevious } = usePreviousDepartment(departments);

  // Função auxiliar para encontrar um processo pelo ID
  const findProcessById = (processId: string) => {
    return processes.find(p => p.id === processId);
  };

  // Função wrapper para moveProcessToNextDepartment que busca o processo pelo ID
  const moveProcessToNextDepartment = async (processId: string) => {
    const process = findProcessById(processId);
    if (!process) return false;
    return await moveNext(process);
  };

  // Função wrapper para moveProcessToPreviousDepartment que busca o processo pelo ID
  const moveProcessToPreviousDepartment = async (processId: string) => {
    const process = findProcessById(processId);
    if (!process) return false;
    return await movePrevious(process);
  };

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment
  };
};
