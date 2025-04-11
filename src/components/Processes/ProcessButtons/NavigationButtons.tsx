
import React from 'react';
import { Button } from "@/components/ui/button";
import { MoveLeft, MoveRight } from "lucide-react";

interface NavigationButtonsProps {
  processId: string;
  isFirstDepartment: boolean;
  isLastDepartment: boolean;
  moveProcessToPreviousDepartment: (processId: string) => void;
  moveProcessToNextDepartment: (processId: string) => void;
}

const NavigationButtons = ({
  processId,
  isFirstDepartment,
  isLastDepartment,
  moveProcessToPreviousDepartment,
  moveProcessToNextDepartment
}: NavigationButtonsProps) => {
  return (
    <>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToPreviousDepartment(processId)} 
        disabled={isFirstDepartment} 
        title="Mover para departamento anterior"
        className={isFirstDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveLeft className="h-4 w-4" />
      </Button>
      <Button 
        variant="ghost" 
        size="icon" 
        onClick={() => moveProcessToNextDepartment(processId)} 
        disabled={isLastDepartment} 
        title="Mover para próximo departamento"
        className={isLastDepartment ? "opacity-50 cursor-not-allowed" : ""}
      >
        <MoveRight className="h-4 w-4" />
      </Button>
    </>
  );
};

export default NavigationButtons;
