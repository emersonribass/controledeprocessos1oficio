
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play } from "lucide-react";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (value: boolean) => void;
  isEditing: boolean;
  status: string;
  startProcess?: (processId: string) => Promise<void>;
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
}: ProcessActionButtonsProps) => {
  const isNotStarted = status === "not_started";

  return (
    <div className="flex justify-end gap-2">
      {isNotStarted ? (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => startProcess && startProcess(processId)}
          title="Iniciar processo"
        >
          <Play className="h-4 w-4" />
        </Button>
      ) : (
        <>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveProcessToPreviousDepartment(processId)}
            disabled={isFirstDepartment}
            title="Mover para departamento anterior"
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => moveProcessToNextDepartment(processId)}
            disabled={isLastDepartment}
            title="Mover para próximo departamento"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ProcessActionButtons;
