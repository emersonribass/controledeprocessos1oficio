
import { Button } from "@/components/ui/button";
import { Eye, MoveLeft, MoveRight, PencilIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (value: boolean) => void;
  isEditing: boolean;
}

const ProcessActionButtons = ({
  processId,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  setIsEditing,
  isEditing,
}: ProcessActionButtonsProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex justify-end gap-2">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => moveProcessToPreviousDepartment(processId)}
        disabled={isFirstDepartment}
      >
        <MoveLeft className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => moveProcessToNextDepartment(processId)}
        disabled={isLastDepartment}
      >
        <MoveRight className="h-4 w-4" />
      </Button>
      {!isEditing && (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsEditing(true)}
          title="Editar tipo"
        >
          <PencilIcon className="h-4 w-4" />
        </Button>
      )}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => navigate(`/processes/${processId}`)}
      >
        <Eye className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProcessActionButtons;
