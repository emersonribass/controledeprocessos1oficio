
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight, Play, CheckCircle } from "lucide-react";
import { useAuth } from "@/hooks/auth";
import { memo } from "react";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { createLogger } from "@/utils/loggerUtils";
import { useToastService } from "@/utils/toastUtils";
import { Process } from "@/types";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";

const logger = createLogger("ProcessActionButtons");

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
  isUserProcessOwner?: boolean;
  process?: Process; // Novo: objeto process completo
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
  sectorId,
  isUserProcessOwner = false,
  process,
}: ProcessActionButtonsProps) => {
  const { user } = useAuth();
  const { userProfile } = useUserProfile();
  const toast = useToastService();
  const { isUserProcessOwner: checkIsUserProcessOwner } = useProcessResponsibility();
  
  // Verificação se o usuário pertence ao setor atual
  const isUserInSector = sectorId && userProfile?.setores_atribuidos?.includes(sectorId);
  
  // Determinamos se o usuário é dono do processo usando o hook diretamente quando possível
  const isOwner = process && user ? checkIsUserProcessOwner(process, user.id) : isUserProcessOwner;
  
  // Condição para exibir o botão aceitar (igual à ProcessResponsibleInfo.tsx)
  const canAcceptResponsibility = !hasSectorResponsible && (isUserInSector || isOwner);

  // Log detalhado para diagnóstico
  logger.debug(`ProcessActionButtons - processId: ${processId}, status: ${status}, hasSectorResponsible: ${hasSectorResponsible}, isUserInSector: ${isUserInSector}, isOwner: ${isOwner}, canAcceptResponsibility: ${canAcceptResponsibility}, sectorId: ${sectorId}, onAcceptResponsibility: ${!!onAcceptResponsibility}`);
  
  if (isOwner) {
    logger.debug(`Usuário é dono do processo ${processId} - verificando se botão aceitar será exibido: canAcceptResponsibility=${canAcceptResponsibility}, hasSectorResponsible=${hasSectorResponsible}, status=${status}, onAcceptResponsibility=${!!onAcceptResponsibility}`);
  }

  const isNotStarted = status === "not_started";
  const isCompleted = status === "completed";

  const validateProcessType = (): boolean => {
    if (!processType) {
      toast.error(
        "Tipo de processo obrigatório", 
        "É necessário selecionar um tipo de processo antes de iniciá-lo."
      );
      return false;
    }
    return true;
  };

  const handleMoveToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Para processos não iniciados
  if (isNotStarted && startProcess) {
    return <div className="flex justify-center gap-1 process-action">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleStartProcess} 
          title={!processType ? "Selecione um tipo de processo" : "Iniciar processo"} 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action px-[6px]"
        >
          <Play className="h-3 w-3" />
          Iniciar
        </Button>
      </div>;
  }

  // Para processos sem responsável (exibir botão aceitar)
  // Verificar TODAS as condições necessárias
  if (
    onAcceptResponsibility && 
    status !== "completed" && 
    canAcceptResponsibility
  ) {
    logger.debug(`EXIBINDO BOTÃO ACEITAR para processo ${processId}`);
    logger.debug(`Condições: onAcceptResponsibility=${!!onAcceptResponsibility}, status=${status}, canAcceptResponsibility=${canAcceptResponsibility}, hasSectorResponsible=${hasSectorResponsible}, isOwner=${isOwner}`);
    
    return <div className="flex justify-center gap-1 process-action">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAcceptResponsibility} 
          disabled={isAccepting} 
          title="Aceitar processo" 
          className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1 process-action mx-0 px-[6px]"
        >
          <CheckCircle className="h-3 w-3" />
          {isAccepting ? "Processando..." : "Aceitar"}
        </Button>
      </div>;
  }

  // Botões de navegação entre setores
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
});

ProcessActionButtons.displayName = 'ProcessActionButtons';
export default ProcessActionButtons;
