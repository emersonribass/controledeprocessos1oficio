
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { getProcessResponsible, getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  const processRequestMade = useRef(false);
  const sectorRequestMade = useRef(false);
  
  const loadProcessResponsible = useCallback(async (processStatus?: string) => {
    if (!processId || processRequestMade.current || processStatus === 'not_started') return null;
    
    processRequestMade.current = true;
    
    try {
      const resp = await getProcessResponsible(processId, processStatus);
      setProcessResponsible(resp);
      return resp;
    } catch (error) {
      console.error("Erro ao carregar responsável principal:", error);
      return null;
    }
  }, [processId, getProcessResponsible]);
  
  const loadSectorResponsible = useCallback(async (processStatus?: string) => {
    if (!processId || !sectorId || sectorRequestMade.current || processStatus === 'not_started') return null;
    
    sectorRequestMade.current = true;
    
    try {
      const resp = await getSectorResponsible(processId, sectorId, processStatus);
      setSectorResponsible(resp);
      return resp;
    } catch (error) {
      console.error("Erro ao carregar responsável do setor:", error);
      return null;
    }
  }, [processId, sectorId, getSectorResponsible]);
  
  const loadResponsibles = useCallback(async (processStatus?: string) => {
    if (!processId || !sectorId || processStatus === 'not_started') {
      return;
    }
    
    setIsLoading(true);
    
    try {
      await Promise.all([
        loadProcessResponsible(processStatus),
        loadSectorResponsible(processStatus)
      ]);
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processId, sectorId, loadProcessResponsible, loadSectorResponsible]);

  // Mantenha o método existente, adicionando o parâmetro de status do processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber: string, processStatus?: string): Promise<void> => {
    if (!processId || !protocolNumber || processStatus === 'not_started') return;
    
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      processRequestMade.current = false;
      sectorRequestMade.current = false;
      await loadResponsibles(processStatus);
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  useEffect(() => {
    processRequestMade.current = false;
    sectorRequestMade.current = false;
    
    // Adicione um parâmetro de status do processo para os métodos
    if (processId && sectorId) {
      // Você precisará passar o status do processo aqui
      // Isso dependerá de como você obtém o status do processo no componente pai
      loadResponsibles();
    }
    
    return () => {
      processRequestMade.current = false;
      sectorRequestMade.current = false;
    };
  }, [loadResponsibles, processId, sectorId]);

  return {
    isLoading,
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    refreshResponsibles: loadResponsibles
  };
};

