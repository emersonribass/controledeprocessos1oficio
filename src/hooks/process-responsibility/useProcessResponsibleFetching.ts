
import { useCallback } from "react";
import { useProcessResponsibleFetcher } from "./useProcessResponsibleFetcher";
import { useSectorResponsibleFetcher } from "./useSectorResponsibleFetcher";
import { useProcessResponsibleCache } from "./useProcessResponsibleCache";

/**
 * Hook unificado para buscar responsáveis por processos e setores
 * Refatorado para utilizar hooks mais específicos e reduzir a complexidade
 */
export const useProcessResponsibleFetching = () => {
  const { getProcessResponsible } = useProcessResponsibleFetcher();
  const { getSectorResponsible } = useSectorResponsibleFetcher();
  const { clearCache } = useProcessResponsibleCache();

  return {
    getProcessResponsible,
    getSectorResponsible,
    clearCache
  };
};
