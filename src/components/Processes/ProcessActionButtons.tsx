
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth";
import { memo } from "react";
import { useToast } from "@/hooks/use-toast";
import { useUserProfile } from "@/hooks/auth/useUserProfile";

interface ProcessActionButtonsProps {
  processId: string;
  processType?: string;
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

const ProcessActionButtons = memo(({
  processId,
  processType,
  protocolNumber,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  setIsEditing,
  isEditing,
  status,
  startProcess,
  hasSectorResponsible = false,
  onAcceptResponsibility,
  isAccepting = false,
  sectorId
}: ProcessActionButtonsProps) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const { isUserResponsibleForSector } = useProcessResponsibility();
  const isNotStarted = status === "not_started";
  const isCompleted = status === "completed";
  const { toast } = useToast();

  // Verifica se o usuário tem o setor atribuído
  const isUserInSector = sectorId && userProfile?.setores_atribuidos?.includes(sectorId);

  // Função para verificar se o tipo de processo está definido antes de mover
  const validateProcessType = (): boolean => {
    if (!processType) {
      toast({
        title: "Aviso",
        description: "É necessário selecionar um tipo de processo antes de movê-lo para o próximo setor.",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleMoveToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validar se o tipo está preenchido antes de mover
    if (!validateProcessType()) {
      return;
    }
    moveProcessToNextDepartment(processId);
  };

  const handleMoveToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    moveProcessToPreviousDepartment(processId);
  };

  const handleStartProcess = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    // Validar se o tipo está preenchido antes de iniciar
    if (!validateProcessType()) {
      return;
    }
    if (startProcess) {
      startProcess(processId);
    }
  };

  const handleAcceptResponsibility = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (onAcceptResponsibility) {
      onAcceptResponsibility();
    }
  };

  // Se o processo não está iniciado E o usuário tem permissão para iniciar (startProcess está disponível)
  if (isNotStarted && startProcess) {
    return <div className="flex justify-center gap-1 process-action">
        <Button variant="outline" size="sm" onClick={handleStartProcess} title="Iniciar processo" className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action px-[6px]">
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      </div>;
  }

  // Se não há responsável no setor e o processo não está concluído e o usuário está no setor atual do processo
  if (!hasSectorResponsible && onAcceptResponsibility && status !== "completed" && isUserInSector) {
    return <div className="flex justify-center gap-1 process-action">
        <Button variant="outline" size="sm" onClick={handleAcceptResponsibility} disabled={isAccepting} title="Aceitar processo" className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action mx-0 px-[6px]">
          <CheckCircle className="h-3 w-3" />
          {isAccepting ? "Processando..." : "Aceitar Processo"}
        </Button>
      </div>;
  }

  // Caso contrário, mostra os botões de navegação entre departamentos
  return <div className="flex justify-center gap-2 process-action">
      <Button variant="ghost" size="icon" onClick={handleMoveToPrevious} disabled={isFirstDepartment} title="Mover para setor anterior" className={`process-action ${isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}`}>
        <MoveLeft className="h-4 w-4" />
      </Button>
      <Button variant="ghost" size="icon" onClick={handleMoveToNext} disabled={isCompleted} title="Mover para próximo setor" className={`process-action ${isCompleted ? "opacity-50 cursor-not-allowed" : ""}`}>
        <MoveRight className="h-4 w-4" />
      </Button>
    </div>;
});

// Adicionando displayName para facilitar debugging
ProcessActionButtons.displayName = 'ProcessActionButtons';
export default ProcessActionButtons;
