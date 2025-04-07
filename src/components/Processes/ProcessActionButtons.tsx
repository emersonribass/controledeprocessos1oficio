
import { ChevronLeft, ChevronRight, Play, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Process } from "@/types";
import { useNavigate } from "react-router-dom";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (isEditing: boolean) => void;
  isEditing: boolean;
  status?: Process['status'];
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
  const navigate = useNavigate();
  
  const isNotStarted = status === "not_started";

  const handleShowPlan = () => {
    navigate(`/processes/${processId}/plan`);
  };
  
  return (
    <div className="flex items-center justify-end space-x-1">
      <Button
        variant="outline"
        size="sm"
        onClick={() => moveProcessToPreviousDepartment(processId)}
        disabled={isFirstDepartment || isEditing || isNotStarted}
      >
        <ChevronLeft className="h-4 w-4" />
      </Button>
      
      {isNotStarted && startProcess && (
        <Button
          variant="outline"
          size="sm"
          onClick={() => startProcess(processId)}
        >
          <Play className="h-4 w-4" />
          <span className="sr-only md:not-sr-only md:ml-2">Iniciar</span>
        </Button>
      )}
      
      <Button
        variant="outline"
        size="sm"
        onClick={handleShowPlan}
        title="Ver plano do processo"
      >
        <FileText className="h-4 w-4" />
        <span className="sr-only md:not-sr-only md:ml-2">Plano</span>
      </Button>
      
      <Button
        variant="outline"
        size="sm"
        onClick={() => moveProcessToNextDepartment(processId)}
        disabled={isLastDepartment || isEditing || isNotStarted}
      >
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProcessActionButtons;
