
import React from 'react';
import ProcessActionButtons from './ProcessActionButtons';
import { createLogger } from "@/utils/loggerUtils";

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
  onRenewalComplete?: () => void; // Adicionando a propriedade aqui
  showRenewDeadlineButton?: boolean;
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
  onRenewalComplete, // Incluindo na desestruturação
  showRenewDeadlineButton = false
}: ProcessRowActionsProps) => {
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
      showRenewDeadlineButton={showRenewDeadlineButton}
      renewalHistoryId={historyId}
      onRenewalComplete={onRenewalComplete} // Passando a propriedade
    />
  );
};

export default ProcessRowActions;
