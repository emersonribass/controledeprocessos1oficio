
import { Process } from "@/types";
import ProcessNotStartedItem from "./ProcessNotStartedItem";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Trash2 } from "lucide-react";

interface ProcessNotStartedListProps {
  processes: Process[];
  selectedProcesses: string[];
  selectAllChecked: boolean;
  onToggleSelectAll: () => void;
  onToggleProcessSelection: (processId: string) => void;
  onStartProcess: (processId: string) => void;
  onDeleteProcess: (processId: string) => void;
  onBatchDelete: () => void;
}

const ProcessNotStartedList = ({
  processes,
  selectedProcesses,
  selectAllChecked,
  onToggleSelectAll,
  onToggleProcessSelection,
  onStartProcess,
  onDeleteProcess,
  onBatchDelete
}: ProcessNotStartedListProps) => {
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
      <div className="flex items-center justify-between py-2 px-4 border-b">
        <div className="flex items-center">
          <Checkbox 
            id="select-all"
            checked={selectAllChecked}
            onCheckedChange={onToggleSelectAll}
          />
          <label htmlFor="select-all" className="ml-2 text-sm font-medium">
            Selecionar todos
          </label>
        </div>
        
        {selectedProcesses.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            onClick={onBatchDelete}
            className="gap-1"
          >
            <Trash2 className="h-4 w-4" />
            Excluir Selecionados ({selectedProcesses.length})
          </Button>
        )}
      </div>
      
      {processes.map(process => (
        <ProcessNotStartedItem
          key={process.id}
          process={process}
          isSelected={selectedProcesses.includes(process.id)}
          onToggleSelect={onToggleProcessSelection}
          onStartProcess={onStartProcess}
          onDeleteProcess={onDeleteProcess}
        />
      ))}
    </div>
  );
};

export default ProcessNotStartedList;
