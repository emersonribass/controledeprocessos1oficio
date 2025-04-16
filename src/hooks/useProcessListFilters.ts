
import { useState, useEffect } from "react";

interface ProcessFilters {
  department?: string;
  status?: string;
  processType?: string;
  search?: string;
  excludeCompleted?: boolean;
}

/**
 * Hook para gerenciar filtros de processos na lista de processos
 */
export const useProcessListFilters = (initialFilters: ProcessFilters = {}) => {
  // Garantir que os valores iniciais nunca sejam strings vazias
  const safeInitialFilters = {
    department: initialFilters.department || undefined,
    status: initialFilters.status || undefined,
    processType: initialFilters.processType || undefined,
    search: initialFilters.search || undefined,
    excludeCompleted: initialFilters.excludeCompleted || false
  };
  
  const [filters, setFilters] = useState<ProcessFilters>(safeInitialFilters);
  
  // Atualiza os filtros quando os filtros iniciais mudam
  useEffect(() => {
    if (Object.keys(initialFilters).length > 0) {
      const safe = {
        department: initialFilters.department || undefined,
        status: initialFilters.status || undefined,
        processType: initialFilters.processType || undefined,
        search: initialFilters.search || undefined,
        excludeCompleted: initialFilters.excludeCompleted || false
      };
      setFilters(safe);
    }
  }, [initialFilters]);

  return {
    filters,
    setFilters
  };
};
