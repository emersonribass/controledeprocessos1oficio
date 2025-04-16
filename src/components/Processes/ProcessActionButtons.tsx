
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AcceptProcessResponsibilityButton from "./AcceptProcessResponsibilityButton";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  status: string;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible?: boolean;
  protocolNumber?: string;
  onAcceptResponsibility?: () => Promise<void>;
  isAccepting?: boolean;
  sectorId?: string;
  isSectorResponsible?: boolean;
}

const ProcessActionButtons = ({
  processId,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  setIsEditing,
  isEditing,
  status,
  startProcess,
  hasSectorResponsible = false,
  protocolNumber,
  onAcceptResponsibility,
  isAccepting = false,
  sectorId,
  isSectorResponsible = false
}: ProcessActionButtonsProps) => {
  const canMoveProcess = status !== "not_started" && status !== "completed" && isSectorResponsible;
  
  return (
    <div className="flex gap-1 justify-end">
      {status === "not_started" && startProcess && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                startProcess(processId);
              }}
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action"
              data-testid="start-process"
            >
              <Play className="h-3 w-3" />
              Iniciar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Iniciar processo</TooltipContent>
        </Tooltip>
      )}

      {status !== "not_started" && status !== "completed" && !hasSectorResponsible && onAcceptResponsibility && (
        <AcceptProcessResponsibilityButton
          processId={processId}
          protocolNumber={protocolNumber}
          sectorId={sectorId}
          hasResponsibleUser={hasSectorResponsible}
          onAccept={onAcceptResponsibility}
          isAccepting={isAccepting}
        />
      )}

      {canMoveProcess && !isFirstDepartment && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                moveProcessToPreviousDepartment(processId);
              }}
              className="bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
              data-testid="move-previous"
            >
              <MoveLeft className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para departamento anterior</TooltipContent>
        </Tooltip>
      )}

      {canMoveProcess && !isLastDepartment && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                moveProcessToNextDepartment(processId);
              }}
              className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200"
              data-testid="move-next"
            >
              <MoveRight className="h-4 w-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Mover para próximo departamento</TooltipContent>
        </Tooltip>
      )}
    </div>
  );
};

export default ProcessActionButtons;
