
import { useState, useEffect, useCallback, memo } from "react";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useAvailableUsers } from "@/hooks/useAvailableUsers";
import { Department } from "@/types";
import SearchFilter from "./Filters/SearchFilter";
import DateRangeFilter from "./Filters/DateRangeFilter";
import SelectFilters from "./Filters/SelectFilters";
import FilterActions from "./Filters/FilterActions";

interface ProcessFiltersProps {
  filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
    startDate?: string;
    endDate?: string;
    responsibleUser?: string;
  };
  setFilters: React.Dispatch<React.SetStateAction<{
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
    startDate?: string;
    endDate?: string;
    responsibleUser?: string;
  }>>;
  availableDepartments?: Department[];
}

// Usando memo para evitar renderizações desnecessárias
const ProcessFilters = memo(({
  filters,
  setFilters,
  availableDepartments
}: ProcessFiltersProps) => {
  const { processTypes } = useProcessTypes();
  const { usuarios } = useAvailableUsers();
  const [search, setSearch] = useState("");
  const [initialDate, setInitialDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [finalDate, setFinalDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

  useEffect(() => {
    setSearch(filters.search || "");
  }, [filters.search]);

  useEffect(() => {
    setInitialDate(filters.startDate ? new Date(filters.startDate) : undefined);
    setFinalDate(filters.endDate ? new Date(filters.endDate) : undefined);
  }, [filters.startDate, filters.endDate]);

  const debounce = (func: Function, delay: number) => {
    let timeoutId: NodeJS.Timeout;
    return function (...args: any[]) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        func(...args);
      }, delay);
    };
  };

  // Usando useCallback para evitar recriação de funções a cada renderização
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setFilters(prev => ({
        ...prev,
        search: value.trim() === "" ? undefined : value
      }));
    }, 300),
    [setFilters]
  );

  const handleSearchChange = useCallback((value: string) => {
    setSearch(value);
    debouncedSearch(value);
  }, [debouncedSearch]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFilters(prev => ({
        ...prev,
        search: search.trim() === "" ? undefined : search
      }));
    }
  }, [search, setFilters]);

  const handleClearFilters = useCallback(() => {
    setFilters({ excludeCompleted: filters.excludeCompleted });
    setSearch("");
    setInitialDate(undefined);
    setFinalDate(undefined);
  }, [filters.excludeCompleted, setFilters]);

  const handleSelectChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  }, [setFilters]);

  const toggleExcludeCompleted = useCallback(() => {
    setFilters(prev => ({
      ...prev,
      excludeCompleted: !prev.excludeCompleted
    }));
  }, [setFilters]);

  const handleInitialDateChange = useCallback((date: Date | undefined) => {
    setInitialDate(date);
    setFilters(prev => ({
      ...prev,
      startDate: date ? date.toISOString().slice(0, 10) : undefined,
    }));
  }, [setFilters]);

  const handleFinalDateChange = useCallback((date: Date | undefined) => {
    setFinalDate(date);
    setFilters(prev => ({
      ...prev,
      endDate: date ? date.toISOString().slice(0, 10) : undefined,
    }));
  }, [setFilters]);

  const deptsToShow = availableDepartments || [];
  const hasActiveFilters = (
    Object.keys(filters)
      .filter(k => !["excludeCompleted"].includes(k))
      .some(k => filters[k as keyof typeof filters] !== undefined)
  );

  return (
    <div className="space-y-3">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-4">
        <SearchFilter
          search={search}
          onChange={handleSearchChange}
          onKeyDown={handleKeyDown}
        />
      </div>

      <div className="grid gap-3 grid-cols-1 md:grid-cols-5">
        <SelectFilters
          filters={filters}
          onSelectChange={handleSelectChange}
          departments={deptsToShow}
          processTypes={processTypes}
          usuarios={usuarios}
        />
        <DateRangeFilter
          initialDate={initialDate}
          finalDate={finalDate}
          onInitialDateChange={handleInitialDateChange}
          onFinalDateChange={handleFinalDateChange}
        />
      </div>

      <FilterActions
        excludeCompleted={!!filters.excludeCompleted}
        onToggleExcludeCompleted={toggleExcludeCompleted}
        hasActiveFilters={hasActiveFilters}
        onClearFilters={handleClearFilters}
      />
    </div>
  );
});

// Adicionando displayName para melhorar a depuração
ProcessFilters.displayName = 'ProcessFilters';

export default ProcessFilters;
