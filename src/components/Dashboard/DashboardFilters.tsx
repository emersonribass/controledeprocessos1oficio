
import { Department } from "@/types";
import { useState, memo, useCallback } from "react";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useAvailableUsers } from "@/hooks/useAvailableUsers";
import SelectFilters from "../Processes/Filters/SelectFilters";
import DateRangeFilter from "../Processes/Filters/DateRangeFilter";

interface DashboardFiltersProps {
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

const DashboardFilters = memo(({
  filters,
  setFilters,
  availableDepartments = []
}: DashboardFiltersProps) => {
  const { processTypes } = useProcessTypes();
  const { usuarios } = useAvailableUsers();
  const [initialDate, setInitialDate] = useState<Date | undefined>(
    filters.startDate ? new Date(filters.startDate) : undefined
  );
  const [finalDate, setFinalDate] = useState<Date | undefined>(
    filters.endDate ? new Date(filters.endDate) : undefined
  );

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

  const handleSelectChange = useCallback((key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === "all" ? undefined : value
    }));
  }, [setFilters]);

  return (
    <div className="space-y-3 mb-6">
      <div className="grid gap-3 grid-cols-1 md:grid-cols-5">
        <SelectFilters
          filters={filters}
          onSelectChange={handleSelectChange}
          departments={availableDepartments}
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
    </div>
  );
});

DashboardFilters.displayName = 'DashboardFilters';

export default DashboardFilters;
