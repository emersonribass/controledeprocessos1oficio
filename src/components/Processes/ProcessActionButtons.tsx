
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";

interface ProcessActionButtonsProps {
  processId: string;
  protocolNumber?: string;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  setIsEditing: (value: boolean) => void;
  isEditing: boolean;
  status: string;
  startProcess?: (processId: string) => Promise<void>;
  hasSectorResponsible?: boolean;
  onAcceptResponsibility?: () => Promise<void>;
  isAccepting?: boolean;
  sectorId?: string;
}

const ProcessActionButtons = ({
  processId,
  protocolNumber,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  setIsEditing,
  isEditing,
  status,
  startProcess,
  hasSectorResponsible = true,
  onAcceptResponsibility,
  isAccepting = false,
  sectorId
}: ProcessActionButtonsProps) => {
  const isNotStarted = status === "not_started";
  const isCompleted = status === "completed";
  
  const handleMoveToNext = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await moveProcessToNextDepartment(processId);
  };
  
  const handleMoveToPrevious = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await moveProcessToPreviousDepartment(processId);
  };
  
  const handleStartProcess = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (startProcess) {
      await startProcess(processId);
    }
  };
  
  const handleAcceptResponsibility = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAcceptResponsibility) {
      await onAcceptResponsibility();
    }
  };
  
  // Se o processo não está iniciado, mostra apenas o botão de iniciar
  if (isNotStarted) {
    return (
      <div className="flex justify-center gap-2 process-action">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStartProcess} 
          title="Iniciar processo" 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action"
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      </div>
    );
  }
  
 
  // Se não há responsável no setor, mostra apenas o botão de aceitar processo
  if (!hasSectorResponsible && onAcceptResponsibility) {
    return (
      <div className="flex justify-center gap-2 process-action">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAcceptResponsibility} 
          disabled={isAccepting}
          title="Aceitar processo" 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action"
        >
          <CheckCircle className="h-3 w-3" />
          {isAccepting ? "Processando..." : "Aceitar Processo"}
        </Button>
      </div>
    );
  }
  
  // Caso contrário, mostra os botões de navegação entre departamentos
  return (
    <div className="flex justify-center gap-2 process-action">
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleMoveToPrevious} 
        disabled={isFirstDepartment} 
        title="Mover para setor anterior"
        className={`process-action ${isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <MoveLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={handleMoveToNext} 
        disabled={isCompleted} 
        title="Mover para próximo setor"
        className={`process-action ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}
      >
        <MoveRight className="h-4 w-4" />
      </Button>
    </div>
  );
};

export default ProcessActionButtons;
