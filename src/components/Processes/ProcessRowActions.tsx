
import { TableCell } from "@/components/ui/table";
import ProcessActionButtons from "./ProcessActionButtons";
import ProcessStatusBadge from "./ProcessStatusBadge";

interface ProcessRowActionsProps {
  processId: string;
  protocolNumber?: string;
  processType?: string;
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
  isOverdue?: boolean;
  currentDepartment?: string;
  historyId?: number;
  onRenewalComplete?: () => void;
}

const ProcessRowActions = ({
  processId,
  protocolNumber,
  processType,
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
  isOverdue,
  currentDepartment,
  historyId,
  onRenewalComplete
}: ProcessRowActionsProps) => {
  return (
    <ProcessActionButtons 
      processId={processId} 
      protocolNumber={protocolNumber}
      processType={processType}
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
      // Não passamos as props relacionadas ao botão de renovação na lista de processos
      // para evitar logs desnecessários
    />
  );
};

export default ProcessRowActions;
