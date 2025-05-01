
import { Process } from "@/types";
import { useMemo } from "react";

/**
 * Hook otimizado para filtrar processos por status
 */
export const useProcessStatusFilters = () => {
  // Função memoizada para verificar se um processo está em atraso
  const isProcessOverdue = useMemo(() => (process: Process): boolean => {
    if (
      process.status !== 'pending' || 
      !process.startDate ||
      !process.expectedEndDate
    ) {
      return false;
    }

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  }, []);

  /**
   * Aplica filtros de usuário com algoritmo otimizado
   */
  const applyUserFilters = (
    processes: Process[],
    filters: {
      department?: string;
      status?: string;
      processType?: string;
      search?: string;
      excludeCompleted?: boolean;
      startDate?: string;
      endDate?: string;
      responsibleUser?: string;
    },
    processesResponsibles?: Record<string, any>
  ): Process[] => {
    // Cache de departamento para evitar filtragem repetida
    const departmentFilterCache: Record<string, boolean> = {};
    // Cache de tipo de processo para evitar filtragem repetida
    const processTypeFilterCache: Record<string, boolean> = {};
    
    return processes.filter(process => {
      // Filtro por departamento
      if (filters.department) {
        // Usar cache para evitar verificações repetidas
        const deptCacheKey = `${process.id}:${filters.department}`;
        if (departmentFilterCache[deptCacheKey] === undefined) {
          departmentFilterCache[deptCacheKey] = process.currentDepartment === filters.department;
        }
        if (!departmentFilterCache[deptCacheKey]) return false;
      }

      // Filtro por status
      if (filters.status) {
        switch (filters.status) {
          case 'overdue':
            if (!isProcessOverdue(process)) return false;
            break;
          case 'completed':
            if (process.status !== 'completed') return false;
            break;
          case 'pending':
            if (process.status !== 'pending') return false;
            break;
          case 'not_started':
            if (process.status !== 'not_started') return false;
            break;
        }
      }

      // Filtro para excluir processos concluídos
      if (filters.excludeCompleted && process.status === 'completed') {
        return false;
      }

      // Filtro por tipo de processo
      if (filters.processType) {
        // Usar cache para evitar verificações repetidas
        const typeCacheKey = `${process.id}:${filters.processType}`;
        if (processTypeFilterCache[typeCacheKey] === undefined) {
          processTypeFilterCache[typeCacheKey] = process.processType === filters.processType;
        }
        if (!processTypeFilterCache[typeCacheKey]) return false;
      }

      // Filtro por texto de busca (número de protocolo)
      if (filters.search && filters.search.trim() !== '') {
        const searchText = filters.search.trim().toLowerCase();
        const protocolNumber = process.protocolNumber?.toLowerCase() || '';
        if (!protocolNumber.includes(searchText)) return false;
      }

      // Filtro por data de início
      if (filters.startDate && process.createdAt) {
        const filterStartDate = new Date(filters.startDate);
        filterStartDate.setHours(0, 0, 0, 0);
        const createdAt = new Date(process.createdAt);
        if (createdAt < filterStartDate) return false;
      }

      // Filtro por data de fim
      if (filters.endDate && process.createdAt) {
        const filterEndDate = new Date(filters.endDate);
        filterEndDate.setHours(23, 59, 59, 999);
        const createdAt = new Date(process.createdAt);
        if (createdAt > filterEndDate) return false;
      }

      // Filtro por usuário responsável
      if (filters.responsibleUser && processesResponsibles) {
        let isResponsibleMatched = false;
        
        // Verificar se o usuário é responsável pelo processo em algum setor
        if (processesResponsibles[process.id]) {
          Object.values(processesResponsibles[process.id]).forEach((responsible: any) => {
            if (responsible && responsible.id === filters.responsibleUser) {
              isResponsibleMatched = true;
            }
          });
        }
        
        if (!isResponsibleMatched) return false;
      }

      // Processo passou por todos os filtros
      return true;
    });
  };

  return {
    isProcessOverdue,
    applyUserFilters
  };
};
