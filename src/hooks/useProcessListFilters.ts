
import { useState, useEffect } from "react";

interface ProcessFilters {
  department?: string;
  status?: string;
  processType?: string;
  search?: string;
  excludeCompleted?: boolean;
}

export const useProcessListFilters = (initialFilters: ProcessFilters = {}) => {
  const [filters, setFilters] = useState<ProcessFilters>(initialFilters);
  
  // Atualiza os filtros quando os filtros iniciais mudam
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      setFilters(initialFilters);
    }
  }, [initialFilters]);

  return {
    filters,
    setFilters
  };
};
