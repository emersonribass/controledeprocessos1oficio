
import { TableCell } from "@/components/ui/table";
import ProcessActionButtons from "./ProcessActionButtons";

interface ProcessRowActionsProps {
  processId: string;
  protocolNumber?: string;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  status: string;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible: boolean;
  onAcceptResponsibility: () => Promise<void>;
  isAccepting: boolean;
  sectorId?: string;
  isSectorResponsible?: boolean;
  isProcessResponsible?: boolean;
  isAdmin?: boolean;
  sectorResponsible?: any;
}

const ProcessRowActions = ({
  processId,
  protocolNumber,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  status,
  startProcess,
  hasSectorResponsible,
  onAcceptResponsibility,
  isAccepting,
  sectorId,
  isSectorResponsible = false,
  isProcessResponsible = false,
  isAdmin = false,
  sectorResponsible
}: ProcessRowActionsProps) => {
  return (
    <TableCell className="text-right process-action">
      <ProcessActionButtons 
        processId={processId} 
        protocolNumber={protocolNumber} 
        moveProcessToPreviousDepartment={moveProcessToPreviousDepartment} 
        moveProcessToNextDepartment={moveProcessToNextDepartment} 
        isFirstDepartment={isFirstDepartment} 
        isLastDepartment={isLastDepartment} 
        setIsEditing={() => {}} 
        isEditing={false} 
        status={status} 
        startProcess={startProcess} 
        hasSectorResponsible={hasSectorResponsible} 
        onAcceptResponsibility={onAcceptResponsibility} 
        isAccepting={isAccepting} 
        sectorId={sectorId}
        isSectorResponsible={isSectorResponsible}
        isProcessResponsible={isProcessResponsible}
        isAdmin={isAdmin}
        sectorResponsible={sectorResponsible}
      />
    </TableCell>
  );
};

export default ProcessRowActions;
