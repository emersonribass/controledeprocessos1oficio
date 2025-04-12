
import { CardFooter } from "@/components/ui/card";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcesses } from "@/hooks/useProcesses";
import { ProcessStatus } from "@/types";

interface ProcessCardFooterProps {
  processId: string;
  protocolNumber: string;
  hasResponsibleUser: boolean;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  moveProcessToNextDepartment: (processId: string) => void;
  moveProcessToPreviousDepartment: (processId: string) => void;
  onProcessAccepted: () => void;
  isMainResponsible?: boolean;
  isSectorResponsible?: boolean;
  currentDepartmentId?: string;
  status: ProcessStatus;
  showLabels?: boolean;
}

const ProcessCardFooter = ({
  processId,
  protocolNumber,
  hasResponsibleUser,
  isFirstDepartment,
  isLastDepartment,
  moveProcessToNextDepartment,
  moveProcessToPreviousDepartment,
  onProcessAccepted,
  isMainResponsible = false,
  isSectorResponsible = false,
  currentDepartmentId,
  status,
  showLabels = false
}: ProcessCardFooterProps) => {
  const { startProcess } = useProcesses();
  
  return (
    <CardFooter className="pt-0 flex justify-center">
      <ProcessActionButtons 
        processId={processId}
        protocolNumber={protocolNumber}
        hasResponsibleUser={hasResponsibleUser}
        isFirstDepartment={isFirstDepartment}
        isLastDepartment={isLastDepartment}
        moveProcessToNextDepartment={moveProcessToNextDepartment}
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
        setIsEditing={() => {}}
        isEditing={false}
        onAccept={onProcessAccepted}
        isMainResponsible={isMainResponsible}
        isSectorResponsible={isSectorResponsible}
        currentDepartmentId={currentDepartmentId}
        status={status}
        startProcess={startProcess}
        showLabels={showLabels}
      />
    </CardFooter>
  );
};

export default ProcessCardFooter;
