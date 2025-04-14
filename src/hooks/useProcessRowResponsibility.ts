import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";
import { useProcesses } from "./useProcesses";

export const useProcessRowResponsibility = (processId: string, sectorId?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
    // Usar filterProcesses do useProcesses para verificações de responsabilidade
  const { filterProcesses } = useProcesses();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = useCallback(async () => {
    if (!sectorId || !processId) return;
    
    setIsLoadingResponsible(true);
    try {
      const responsible = await getSectorResponsible(processId, sectorId);
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
    } finally {
      setIsLoadingResponsible(false);
    }
  }, [processId, sectorId, getSectorResponsible]);

  // Carrega o responsável quando o componente é montado ou quando o departamento atual muda
  useEffect(() => {
    if (processId && sectorId) {
      loadSectorResponsible();
    }
  }, [loadSectorResponsible]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async (protocolNumber?: string) => {
    if (!user || !protocolNumber || !sectorId) return;
    
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      await loadSectorResponsible();
      toast({
        title: "Sucesso",
        description: "Você aceitou a responsabilidade pelo processo."
      });
    }
  };

  return {
    sectorResponsible,
    isLoadingResponsible,
    handleAcceptResponsibility,
    isAccepting
  };
};