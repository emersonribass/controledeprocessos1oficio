
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { ProcessResponsible } from "./process-responsibility/types";

/**
 * Hook para gerenciar responsáveis de um processo específico com carregamento eficiente
 */
export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<ProcessResponsible | null>(null);
  const [sectorResponsible, setSectorResponsible] = useState<ProcessResponsible | null>(null);
  const { 
    getProcessResponsible, 
    getSectorResponsible, 
    acceptProcessResponsibility, 
    isAccepting 
  } = useProcessResponsibility();
  
  // Referências para controlar o estado de carregamento
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
      
      // Carregar os responsáveis em paralelo para melhor desempenho
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
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        // Recarregar os responsáveis após aceitar a responsabilidade
        await loadResponsibles();
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  // Carregar responsáveis ao inicializar ou quando as dependências mudarem
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
