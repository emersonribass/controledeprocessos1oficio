
import React from 'react';
import ProcessActionButtons from './ProcessActionButtons';
import { createLogger } from "@/utils/loggerUtils";
import { Process } from "@/types";

const logger = createLogger("ProcessRowActions");

interface ProcessRowActionsProps {
  processId: string;
  protocolNumber?: string;
  processType?: string;
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
  isOverdue?: boolean;
  currentDepartment?: string;
  historyId?: number;
  onRenewalComplete?: () => void;
  showRenewDeadlineButton?: boolean;
  isUserProcessOwner?: boolean;
  process?: Process; // Novo: objeto process completo
}

const ProcessRowActions = ({
  processId,
  protocolNumber,
  processType,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  status,
  startProcess,
  hasSectorResponsible,
  onAcceptResponsibility,
  isAccepting,
  sectorId,
  isOverdue,
  currentDepartment,
  historyId,
  onRenewalComplete,
  showRenewDeadlineButton = false,
  isUserProcessOwner = false,
  process
}: ProcessRowActionsProps) => {
  // Logs adicionais para diagnóstico
  logger.debug(`ProcessRowActions: processId=${processId}, hasSectorResponsible=${hasSectorResponsible}, isUserProcessOwner=${isUserProcessOwner}, status=${status}`);
  
  if (!hasSectorResponsible && isUserProcessOwner) {
    logger.debug(`ProcessRowActions: Botão aceitar deve ser exibido para processo ${processId}, isUserProcessOwner=${isUserProcessOwner}, hasSectorResponsible=${hasSectorResponsible}`);
  }
  
  // Log para debug do button de renovação
  if (showRenewDeadlineButton && historyId) {
    logger.debug(`Exibindo botão de renovação para processo ${processId}, historyId=${historyId}`);
  }
  
  return (
    <ProcessActionButtons 
      processId={processId} 
      protocolNumber={protocolNumber}
      processType={processType}
      moveProcessToPreviousDepartment={moveProcessToPreviousDepartment} 
      moveProcessToNextDepartment={moveProcessToNextDepartment} 
      isFirstDepartment={isFirstDepartment} 
      isLastDepartment={isLastDepartment} 
      setIsEditing={() => {}} 
      isEditing={false} 
      status={status} 
      startProcess={startProcess} 
      hasSectorResponsible={hasSectorResponsible} 
      onAcceptResponsibility={onAcceptResponsibility} 
      isAccepting={isAccepting} 
      sectorId={sectorId}
      isUserProcessOwner={isUserProcessOwner}
      process={process} // Passando o objeto process completo
    />
  );
};

export default ProcessRowActions;
