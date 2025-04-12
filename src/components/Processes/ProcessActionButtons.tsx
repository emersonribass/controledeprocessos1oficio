
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play } from "lucide-react";

interface ProcessActionButtonsProps {
  processId: string;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
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
  startProcess
}: ProcessActionButtonsProps) => {
  const isNotStarted = status === "not_started";
  
  const handleMoveToNext = async () => {
    await moveProcessToNextDepartment(processId);
  };
  
  const handleMoveToPrevious = async () => {
    await moveProcessToPreviousDepartment(processId);
  };
  
  const handleStartProcess = async () => {
    if (startProcess) {
      await startProcess(processId);
    }
  };
  
  return (
    <div className="flex justify-center gap-2">
      {isNotStarted ? (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStartProcess} 
          title="Iniciar processo" 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1"
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      ) : (
        <>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveToPrevious} 
            disabled={isFirstDepartment} 
            title="Mover para departamento anterior"
            className={isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveToNext} 
            disabled={isLastDepartment} 
            title="Mover para próximo departamento"
            className={isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </>
      )}
    </div>
  );
};

export default ProcessActionButtons;
