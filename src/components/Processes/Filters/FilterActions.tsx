
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { X } from "lucide-react";

interface FilterActionsProps {
  excludeCompleted?: boolean;
  onToggleExcludeCompleted: () => void;
  hasActiveFilters: boolean;
  onClearFilters: () => void;
}

const FilterActions = ({
  excludeCompleted,
  onToggleExcludeCompleted,
  hasActiveFilters,
  onClearFilters
}: FilterActionsProps) => {
  return (
    <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="excludeCompleted"
          checked={excludeCompleted}
          onCheckedChange={onToggleExcludeCompleted}
        />
        <label
          htmlFor="excludeCompleted"
          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
        >
          Ocultar processos concluídos
        </label>
      </div>
      {hasActiveFilters && (
        <Button 
          variant="outline" 
          onClick={onClearFilters} 
          className="flex items-center gap-1 w-fit h-fit bg-green-600 hover:bg-green-500 px-[10px] text-white"
        >
          <X className="h-4 w-4" />
          Limpar filtros
        </Button>
      )}
    </div>
  );
};

export default FilterActions;
