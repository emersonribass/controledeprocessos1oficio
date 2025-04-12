
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
  
  const handlePreviousDepartment = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Desabilitar o botão após o clique para evitar cliques múltiplos
    const button = e.currentTarget as HTMLButtonElement;
    button.disabled = true;
    
    moveProcessToPreviousDepartment(processId);
    
    // Reabilitar o botão após um período de tempo
    setTimeout(() => {
      if (button) button.disabled = false;
    }, 3000); // Aumentado para 3 segundos para dar mais tempo para a operação completar
  };

  const handleNextDepartment = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    // Desabilitar o botão após o clique para evitar cliques múltiplos
    const button = e.currentTarget as HTMLButtonElement;
    button.disabled = true;
    
    moveProcessToNextDepartment(processId);
    
    // Reabilitar o botão após um período de tempo
    setTimeout(() => {
      if (button) button.disabled = false;
    }, 3000); // Aumentado para 3 segundos para dar mais tempo para a operação completar
  };
  
  if (showLabels) {
    return (
      <>
        <Button 
          variant="outline" 
          onClick={handlePreviousDepartment} 
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
          onClick={handleNextDepartment} 
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
        onClick={handlePreviousDepartment} 
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
        onClick={handleNextDepartment} 
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
