
import { Process } from "@/types";
import { useNextDepartment } from "./movement/useNextDepartment";
import { usePreviousDepartment } from "./movement/usePreviousDepartment";

export const useProcessMovement = (processes: Process[]) => {
  const { moveToNextDepartment } = useNextDepartment();
  const { moveToPreviousDepartment } = usePreviousDepartment();

  return {
    moveProcessToNextDepartment: moveToNextDepartment,
    moveProcessToPreviousDepartment: moveToPreviousDepartment
  };
};
