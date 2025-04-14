
import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { getProcessResponsible, getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();

  // Função para carregar responsáveis de forma eficiente
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      // Executar consultas em paralelo
      const [processResp, sectorResp] = await Promise.all([
        getProcessResponsible(processId),
        getSectorResponsible(processId, sectorId)
      ]);
      
      setProcessResponsible(processResp);
      setSectorResponsible(sectorResp);
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processId, sectorId, getProcessResponsible, getSectorResponsible]);

  // Aceitar responsabilidade pelo processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber: string): Promise<void> => {
    if (!processId || !protocolNumber) return;
    
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      await loadResponsibles();
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  // Carregar responsáveis ao inicializar
  useEffect(() => {
    const controller = new AbortController();
    loadResponsibles();
    return () => controller.abort();
  }, [loadResponsibles]);

  return {
    isLoading,
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    refreshResponsibles: loadResponsibles
  };
};
