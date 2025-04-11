
import React from 'react';
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StartProcessButtonProps {
  processId: string;
  startProcess?: (processId: string) => Promise<void>;
}

const StartProcessButton = ({ processId, startProcess }: StartProcessButtonProps) => {
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={() => startProcess && startProcess(processId)} 
      title="Iniciar processo" 
      className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1"
    >
      <Play className="h-3 w-3" />
      Iniciar
    </Button>
  );
};

export default StartProcessButton;
