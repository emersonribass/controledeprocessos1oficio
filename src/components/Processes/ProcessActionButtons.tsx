
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import AcceptProcessResponsibilityButton from "./AcceptProcessResponsibilityButton";
import { useCallback } from "react";

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
  const isCompleted = status === "completed";
  
  // Handlers para garantir que os eventos não propaguem para o clique da linha
  const handleMoveToPrevious = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    moveProcessToPreviousDepartment(processId);
  }, [moveProcessToPreviousDepartment, processId]);
  
  const handleMoveToNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    moveProcessToNextDepartment(processId);
  }, [moveProcessToNextDepartment, processId]);
  
  const handleAcceptResponsibility = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (onAcceptResponsibility) {
      onAcceptResponsibility();
    }
  }, [onAcceptResponsibility]);
  
  const handleStartProcess = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (startProcess) {
      startProcess(processId);
    }
  }, [startProcess, processId]);
  
  // Se o processo não foi iniciado, mostra o botão de iniciar
  if (status === "not_started" && startProcess) {
    return (
      <div className="flex justify-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartProcess}
              className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action"
              data-testid="start-process"
            >
              <Play className="h-3 w-3" />
              Iniciar
            </Button>
          </TooltipTrigger>
          <TooltipContent>Iniciar processo</TooltipContent>
        </Tooltip>
      </div>
    );
  }
  
  // Se não há responsável no setor e o processo não está concluído, mostra o botão de aceitar processo
  if (!hasSectorResponsible && onAcceptResponsibility && status !== "completed") {
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
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveToPrevious} 
            disabled={isFirstDepartment || !canMoveProcess} 
            title="Mover para setor anterior"
            className={`process-action ${isFirstDepartment || !canMoveProcess ? "opacity-50 cursor-not-allowed" : ""}`}
            data-testid="move-previous"
          >
            <MoveLeft className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mover para setor anterior</TooltipContent>
      </Tooltip>
      
      <Tooltip>
        <TooltipTrigger asChild>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleMoveToNext} 
            disabled={isCompleted || !canMoveProcess} 
            title="Mover para próximo setor"
            className={`process-action ${isCompleted || !canMoveProcess ? "opacity-50 cursor-not-allowed" : ""}`}
            data-testid="move-next"
          >
            <MoveRight className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>Mover para próximo setor</TooltipContent>
      </Tooltip>
    </div>
  );
};

export default ProcessActionButtons;
