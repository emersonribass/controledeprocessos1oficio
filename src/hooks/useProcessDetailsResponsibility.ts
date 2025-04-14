
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { getProcessResponsible, getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  // Referências para controlar se os dados já foram carregados
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  // Função para carregar responsáveis de forma eficiente
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId || loadingInProgressRef.current) {
      return;
    }
    
    // Evitar múltiplas chamadas simultâneas
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      console.log(`Carregando responsáveis: processo=${processId}, setor=${sectorId}`);
      
      // Executar consultas em paralelo
      const [processResp, sectorResp] = await Promise.all([
        getProcessResponsible(processId),
        getSectorResponsible(processId, sectorId)
      ]);
      
      setProcessResponsible(processResp);
      setSectorResponsible(sectorResp);
      loadedRef.current = true;
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
      loadingInProgressRef.current = false;
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

  // Carregar responsáveis uma única vez ao inicializar
  useEffect(() => {
    // Resetar o estado quando os IDs mudam
    if (processId && sectorId && !loadedRef.current) {
      loadResponsibles();
    }
    
    return () => {
      // Limpar referências quando o componente é desmontado
      loadedRef.current = false;
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
