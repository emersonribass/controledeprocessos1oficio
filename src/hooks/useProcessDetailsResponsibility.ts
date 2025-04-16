
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { getProcessResponsible, getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  // Referências para controlar requisições já realizadas
  const processRequestMade = useRef(false);
  const sectorRequestMade = useRef(false);
  
  // Função para carregar responsável principal do processo
  const loadProcessResponsible = useCallback(async () => {
    if (!processId || processRequestMade.current) return;
    
    processRequestMade.current = true;
    
    try {
      const resp = await getProcessResponsible(processId);
      setProcessResponsible(resp);
      return resp;
    } catch (error) {
      console.error("Erro ao carregar responsável principal:", error);
      return null;
    }
  }, [processId, getProcessResponsible]);
  
  // Função para carregar responsável do setor
  const loadSectorResponsible = useCallback(async () => {
    if (!processId || !sectorId || sectorRequestMade.current) return;
    
    sectorRequestMade.current = true;
    
    try {
      const resp = await getSectorResponsible(processId, sectorId);
      setSectorResponsible(resp);
      return resp;
    } catch (error) {
      console.error("Erro ao carregar responsável do setor:", error);
      return null;
    }
  }, [processId, sectorId, getSectorResponsible]);
  
  // Função para carregar responsáveis de forma eficiente
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId) {
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Executar consultas em paralelo
      await Promise.all([
        loadProcessResponsible(),
        loadSectorResponsible()
      ]);
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
    } finally {
      setIsLoading(false);
    }
  }, [processId, sectorId, loadProcessResponsible, loadSectorResponsible]);

  // Aceitar responsabilidade pelo processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber: string): Promise<void> => {
    if (!processId || !protocolNumber) return;
    
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      // Redefinir estado para forçar nova busca
      processRequestMade.current = false;
      sectorRequestMade.current = false;
      await loadResponsibles();
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  // Resetar o estado quando os IDs mudam
  useEffect(() => {
    processRequestMade.current = false;
    sectorRequestMade.current = false;
    
    if (processId && sectorId) {
      loadResponsibles();
    }
    
    return () => {
      // Limpar referências quando o componente é desmontado
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
