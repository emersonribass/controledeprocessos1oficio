import { TableCell } from "@/components/ui/table";
import ProcessActionButtons from "./ProcessActionButtons";
import ProcessStatusBadge from "./ProcessStatusBadge";
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
  sectorId
}: ProcessRowActionsProps) => {
  return <>
      
      <TableCell className="text-right">
        <ProcessActionButtons processId={processId} protocolNumber={protocolNumber} moveProcessToPreviousDepartment={moveProcessToPreviousDepartment} moveProcessToNextDepartment={moveProcessToNextDepartment} isFirstDepartment={isFirstDepartment} isLastDepartment={isLastDepartment} setIsEditing={() => {}} isEditing={false} status={status} startProcess={startProcess} hasSectorResponsible={hasSectorResponsible} onAcceptResponsibility={onAcceptResponsibility} isAccepting={isAccepting} sectorId={sectorId} />
      </TableCell>
    </>;
};
export default ProcessRowActions;