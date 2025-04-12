
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";

interface NavigationButtonsProps {
  processId: string;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
  showLabels?: boolean;
  protocolNumber?: string; // Adicionado para melhorar as descrições de acessibilidade
}

const NavigationButtons = ({
  processId,
  isFirstDepartment,
  isLastDepartment,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment,
  showLabels = false,
  protocolNumber = ''
}: NavigationButtonsProps) => {
  const processoTexto = protocolNumber ? `processo ${protocolNumber}` : 'processo';
  
  if (showLabels) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={() => moveProcessToPreviousDepartment(processId)} 
          disabled={isFirstDepartment} 
          title={`Mover ${processoTexto} para departamento anterior`}
          aria-label={`Mover ${processoTexto} para departamento anterior`}
          aria-disabled={isFirstDepartment}
          className={isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}
        >
          <MoveLeft className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>Departamento Anterior</span>
        </Button>
        <Button 
          variant="outline" 
          onClick={() => moveProcessToNextDepartment(processId)} 
          disabled={isLastDepartment} 
          title={`Mover ${processoTexto} para próximo departamento`}
          aria-label={`Mover ${processoTexto} para próximo departamento`}
          aria-disabled={isLastDepartment}
          className={isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}
        >
          <MoveRight className="h-4 w-4 mr-2" aria-hidden="true" />
          <span>Próximo Departamento</span>
        </Button>
      </>
    );
  }

  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToPreviousDepartment(processId)} 
        disabled={isFirstDepartment} 
        title={`Mover ${processoTexto} para departamento anterior`}
        aria-label={`Mover ${processoTexto} para departamento anterior`}
        aria-disabled={isFirstDepartment}
        className={isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveLeft className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Departamento Anterior</span>
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToNextDepartment(processId)} 
        disabled={isLastDepartment}
        title={`Mover ${processoTexto} para próximo departamento`}
        aria-label={`Mover ${processoTexto} para próximo departamento`}
        aria-disabled={isLastDepartment}
        className={isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveRight className="h-4 w-4" aria-hidden="true" />
        <span className="sr-only">Próximo Departamento</span>
      </Button>
    </>
  );
};

export default NavigationButtons;
