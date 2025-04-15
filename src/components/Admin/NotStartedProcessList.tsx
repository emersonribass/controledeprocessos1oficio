import { useState } from "react";
import { Process } from "@/types";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Play, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { formatDistanceToBrasiliaTime } from "@/lib/timezone";

interface NotStartedProcessListProps {
  processes: Process[];
  onStartProcess: (processId: string) => Promise<void>;
  onDeleteProcess: (processId: string) => void;
  selectedProcesses: string[];
  onToggleSelect: (processId: string) => void;
  selectAllChecked: boolean;
  onToggleSelectAll: () => void;
}

const NotStartedProcessList = ({
  processes,
  onStartProcess,
  onDeleteProcess,
  selectedProcesses,
  onToggleSelect,
  selectAllChecked,
  onToggleSelectAll
}: NotStartedProcessListProps) => {
  const navigate = useNavigate();

  if (processes.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-muted-foreground">
          Não há processos aguardando início
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center py-2 px-4 border-b">
        <div className="flex items-center mr-4">
          <Checkbox 
            id="select-all"
            checked={selectAllChecked}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="select-all" className="ml-2 text-sm font-medium">
            Selecionar todos
          </label>
        </div>
      </div>
      
      {processes.map(process => (
        <div key={process.id} className="flex items-center justify-between p-4 border rounded-md">
          <div className="flex items-center">
            <Checkbox
              id={`process-${process.id}`}
              checked={selectedProcesses.includes(process.id)}
              onCheckedChange={() => onToggleSelect(process.id)}
              className="mr-4"
            />
            <div>
              <h4 className="font-medium">{process.protocolNumber}</h4>
              <p className="text-sm text-muted-foreground">
                Cadastrado {formatDistanceToBrasiliaTime(process.startDate)}
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
      ))}
    </div>
  );
};

export default NotStartedProcessList;
