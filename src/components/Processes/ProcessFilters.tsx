
import { useEffect } from "react";
import { ChevronDown, ChevronUp, Filter } from "lucide-react";
import SelectFilters from "./Filters/SelectFilters";
import SearchFilter from "./Filters/SearchFilter";
import DateRangeFilter from "./Filters/DateRangeFilter";
import FilterActions from "./Filters/FilterActions";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useDepartments } from "@/hooks/useDepartments";
import { useAvailableUsers } from "@/hooks/useAvailableUsers";

interface ProcessFiltersProps {
  isExpanded: boolean;
  toggleExpanded: () => void;
  filters: Record<string, string>;
  updateFilter: (key: string, value: string) => void;
  clearFilters: () => void;
  applyFilters: () => void;
  showApplyButton?: boolean;
}

const ProcessFilters = ({
  isExpanded,
  toggleExpanded,
  filters,
  updateFilter,
  clearFilters,
  applyFilters,
  showApplyButton = true,
}: ProcessFiltersProps) => {
  const { processTypes } = useProcessTypes();
  const { departments } = useDepartments();
  const { usuarios, isLoading } = useAvailableUsers();

  // Adicionando log para depuração
  useEffect(() => {
    console.log("Usuários carregados no ProcessFilters:", usuarios);
  }, [usuarios]);

  // Converter string para Date
  const parseDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined;
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? undefined : date;
  };

  const initialDate = parseDate(filters.startDate);
  const finalDate = parseDate(filters.endDate);

  // Converter Date para string ISO
  const formatDateToISO = (date: Date | undefined): string => {
    return date ? date.toISOString() : "";
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm mb-6">
      <div
        className="p-4 flex justify-between items-center cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">Filtros</span>
        </div>
        {isExpanded ? (
          <ChevronUp className="h-4 w-4" />
        ) : (
          <ChevronDown className="h-4 w-4" />
        )}
      </div>

      {isExpanded && (
        <div className="border-t p-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            <SearchFilter
              search={filters.search || ""}
              onChange={(value) => updateFilter("search", value)}
            />
            
            <SelectFilters
              filters={filters}
              onSelectChange={updateFilter}
              departments={departments}
              processTypes={processTypes}
              usuarios={isLoading ? [] : usuarios}
            />

            <DateRangeFilter
              initialDate={initialDate}
              finalDate={finalDate}
              onInitialDateChange={(date) => updateFilter("startDate", formatDateToISO(date))}
              onFinalDateChange={(date) => updateFilter("endDate", formatDateToISO(date))}
            />
          </div>

          <FilterActions
            onClearFilters={clearFilters}
            onApplyFilters={applyFilters}
            showApplyButton={showApplyButton}
          />
        </div>
      )}
    </div>
  );
};

export default ProcessFilters;
