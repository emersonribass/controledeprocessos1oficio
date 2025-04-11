
import React from 'react';
import { PROCESS_STATUS } from "@/types";
import StartProcessButton from "./ProcessButtons/StartProcessButton";
import NavigationButtons from "./ProcessButtons/NavigationButtons";
import AcceptProcessButton from "./ProcessButtons/AcceptProcessButton";

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
  protocolNumber?: string;
  hasResponsibleUser?: boolean;
  onAccept?: () => void;
  currentDepartmentId?: string;
  isMainResponsible?: boolean;
  isSectorResponsible?: boolean;
}

const ProcessActionButtons = ({
  processId,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  isFirstDepartment,
  isLastDepartment,
  status,
  startProcess,
  protocolNumber = "",
  hasResponsibleUser = false,
  onAccept,
  currentDepartmentId,
  isMainResponsible = false,
  isSectorResponsible = false
}: ProcessActionButtonsProps) => {
  
  // Se o processo não foi iniciado, mostrar apenas botão de iniciar
  if (status === PROCESS_STATUS.NOT_STARTED) {
    return (
      <div className="flex justify-center gap-2">
        <StartProcessButton 
          processId={processId} 
          startProcess={startProcess} 
        />
      </div>
    );
  }
  
  // Se o processo está em andamento
  if (status === PROCESS_STATUS.PENDING) {
    // Se o usuário é o responsável principal ou responsável pelo setor, mostrar botões de movimento
    if (isMainResponsible || isSectorResponsible) {
      return (
        <div className="flex justify-center gap-2">
          <NavigationButtons 
            processId={processId}
            isFirstDepartment={isFirstDepartment}
            isLastDepartment={isLastDepartment}
            moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
            moveProcessToNextDepartment={moveProcessToNextDepartment}
          />
        </div>
      );
    }
    
    // Se o processo já foi iniciado, mas o usuário atual não é responsável,
    // e o setor atual não tem um responsável, mostrar botão de aceitar
    if (!hasResponsibleUser) {
      return (
        <div className="flex justify-center gap-2">
          <AcceptProcessButton
            processId={processId}
            protocolNumber={protocolNumber}
            currentDepartmentId={currentDepartmentId}
            onAccept={onAccept}
          />
        </div>
      );
    }
  }

  // Se o processo está concluído, mas não é o último departamento,
  // mostrar botões de navegação
  if (status === PROCESS_STATUS.COMPLETED && !isLastDepartment) {
    return (
      <div className="flex justify-center gap-2">
        <NavigationButtons 
          processId={processId}
          isFirstDepartment={isFirstDepartment}
          isLastDepartment={isLastDepartment}
          moveProcessToPreviousDepartment={moveProcessToPreviousDepartment}
          moveProcessToNextDepartment={moveProcessToNextDepartment}
        />
      </div>
    );
  }
  
  // Caso não caia em nenhum dos casos acima, não mostra nenhum botão
  return null;
};

export default ProcessActionButtons;
