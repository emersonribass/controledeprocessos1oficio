
import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";
import { useProcesses } from "./useProcesses";
import { ProcessResponsibilityService } from "@/services/ProcessResponsibilityService";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useProcessRowResponsibility");

export const useProcessRowResponsibility = (processId: string, sectorId?: string) => {
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const { filterProcesses } = useProcesses();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = useCallback(async () => {
    if (!sectorId || !processId) {
      setSectorResponsible(null);
      return;
    }
    
    setIsLoadingResponsible(true);
    try {
      // Usando o serviço centralizado para evitar duplicação de código
      const responsible = await ProcessResponsibilityService.getSectorResponsible(processId, sectorId);
      
      // Debug para o processo específico
      if (processId === '118866') {
        logger.debug(`Responsável do setor ${sectorId} para processo 118866:`, responsible);
      }
      
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
      setSectorResponsible(null);
    } finally {
      setIsLoadingResponsible(false);
    }
  }, [processId, sectorId]);

  // Carrega o responsável quando o componente é montado ou quando o departamento atual muda
  useEffect(() => {
    const controller = new AbortController();
    
    if (processId && sectorId) {
      loadSectorResponsible();
    }
    
    return () => {
      controller.abort();
    };
  }, [loadSectorResponsible]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber?: string) => {
    if (!user || !protocolNumber || !sectorId) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        await loadSectorResponsible();
        toast({
          title: "Sucesso",
          description: "Você aceitou a responsabilidade pelo processo."
        });
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a responsabilidade.",
        variant: "destructive"
      });
    }
  }, [user, sectorId, processId, acceptProcessResponsibility, loadSectorResponsible, toast]);

  return {
    sectorResponsible,
    isLoadingResponsible,
    handleAcceptResponsibility,
    isAccepting,
    loadSectorResponsible
  };
};
