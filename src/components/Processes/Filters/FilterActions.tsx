
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

interface FilterActionsProps {
  onClearFilters: () => void;
  onApplyFilters: () => void;
  showApplyButton?: boolean;
}

const FilterActions = ({
  onClearFilters,
  onApplyFilters,
  showApplyButton = true
}: FilterActionsProps) => {
  return (
    <div className="flex justify-end gap-2 mt-4">
      <Button 
        variant="outline" 
        onClick={onClearFilters} 
        className="flex items-center gap-1"
      >
        <X className="h-4 w-4" />
        Limpar filtros
      </Button>
      
      {showApplyButton && (
        <Button 
          onClick={onApplyFilters} 
          className="flex items-center gap-1"
        >
          Aplicar filtros
        </Button>
      )}
    </div>
  );
};

export default FilterActions;
