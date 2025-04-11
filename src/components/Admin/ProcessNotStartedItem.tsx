
import { Process } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useNavigate } from "react-router-dom";

interface ProcessNotStartedItemProps {
  process: Process;
  isSelected: boolean;
  onToggleSelect: (processId: string) => void;
  onStartProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
}

const ProcessNotStartedItem = ({
  process,
  isSelected,
  onToggleSelect,
  onStartProcess,
  onDeleteProcess
}: ProcessNotStartedItemProps) => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-between p-4 border rounded-md">
      <div className="flex items-center">
        <Checkbox
          id={`process-${process.id}`}
          checked={isSelected}
          onCheckedChange={() => onToggleSelect(process.id)}
          className="mr-4"
        />
        <div>
          <h4 className="font-medium">{process.protocolNumber}</h4>
          <p className="text-sm text-muted-foreground">
            Cadastrado {formatDistanceToNow(new Date(process.startDate), {
              addSuffix: true,
              locale: ptBR
            })}
          </p>
        </div>
      </div>
      <div className="flex gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => navigate(`/processes/${process.id}`)} 
          className="rounded-lg text-white bg-green-600 hover:bg-green-500"
        >
          Detalhes
        </Button>
        <Button 
          size="sm" 
          onClick={() => onStartProcess(process.id)} 
          className="gap-1 text-white text-center font-medium rounded-lg"
        >
          <Play className="h-4 w-4" />
          Iniciar
        </Button>
        <Button 
          variant="destructive" 
          size="sm" 
          onClick={() => onDeleteProcess(process.id)} 
          className="gap-1"
        >
          <Trash2 className="h-4 w-4" />
          Excluir
        </Button>
      </div>
    </div>
  );
};

export default ProcessNotStartedItem;
