
import { useState, useEffect, useCallback } from 'react';
import { Process } from '@/types';
import { useProcessesFetch } from './useProcessesFetch';
import { useProcessOperations } from './useProcessOperations';
import { useProcessFilters } from './useProcessFilters';
import { useProcesses as useProcessContext } from './process/useProcessContext';
import { useProcessTableState } from './useProcessTableState';

export const useProcesses = () => {
  const { 
    processes: contextProcesses,
    isLoadingProcesses,
    refreshProcesses: contextRefreshProcesses,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible,
    filterProcesses
  } = useProcessContext();
  
  // Usar o hook de estado da tabela de processos
  const { processesResponsibles, isLoading: isLoadingResponsibles, queueSectorForLoading } = useProcessTableState(contextProcesses);

  // Reexportar as funções e estados do contexto
  return {
    processes: contextProcesses,
    isLoadingProcesses: isLoadingProcesses || isLoadingResponsibles,
    refreshProcesses: contextRefreshProcesses,
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    isUserInCurrentSector,
    hasSectorResponsible,
    filterProcesses,
    processesResponsibles,
    queueSectorForLoading
  };
};
