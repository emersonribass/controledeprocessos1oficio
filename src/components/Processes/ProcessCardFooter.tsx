
import { CardFooter } from "@/components/ui/card";
import ProcessActionButtons from "./ProcessActionButtons";
import { useProcesses } from "@/hooks/useProcesses";

type ProcessCardFooterProps = {
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
  status: string;
};

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
  status
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
      />
    </CardFooter>
  );
};

export default ProcessCardFooter;
