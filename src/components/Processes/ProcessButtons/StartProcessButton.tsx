
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

interface StartProcessButtonProps {
  processId: string;
  startProcess?: (processId: string) => Promise<void>;
  protocolNumber?: string; // Adicionado para melhorar a acessibilidade
}

const StartProcessButton = ({ processId, startProcess, protocolNumber }: StartProcessButtonProps) => {
  const handleClick = async () => {
    if (startProcess) {
      try {
        await startProcess(processId);
      } catch (error) {
        console.error("Erro ao iniciar processo:", error);
      }
    }
  };

  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleClick}
      title={`Iniciar processo ${protocolNumber || ''}`}
      aria-label={`Iniciar processo ${protocolNumber || ''}`}
      className="bg-green-100 hover:bg-green-200 text-green-800 border-green-300 flex items-center gap-1"
    >
      <Play className="h-3 w-3" aria-hidden="true" />
      <span>Iniciar</span>
    </Button>
  );
};

export default StartProcessButton;
