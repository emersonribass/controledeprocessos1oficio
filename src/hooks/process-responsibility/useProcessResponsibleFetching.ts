
import { useCallback } from "react";
import { useResponsibilityLoader } from "./useResponsibilityLoader";
import { ProcessResponsible } from "./types";

export const useProcessResponsibleFetching = () => {
  const { loadResponsible } = useResponsibilityLoader();

  // Buscar o responsável por um setor em um processo específico
  const getSectorResponsible = useCallback(
    async (processId: string, sectorId: string): Promise<ProcessResponsible | null> => {
      try {
        return await loadResponsible(processId, sectorId);
      } catch (error) {
        console.error('Erro ao buscar responsável do setor:', error);
        return null;
      }
    },
    [loadResponsible]
  );

  // Adaptador para a API antiga que não esperava o parâmetro sectorId
  const getProcessResponsible = useCallback(
    async (processId: string): Promise<any> => {
      console.warn('getProcessResponsible é deprecated. Use getSectorResponsible com sectorId específico.');
      return null;
    },
    []
  );

  return {
    getSectorResponsible,
    getProcessResponsible
  };
};
