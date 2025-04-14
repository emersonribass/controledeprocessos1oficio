
import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";

export const useProcessRowResponsibility = (processId: string, sectorId?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();

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
  const handleAcceptResponsibility = async (protocolNumber?: string): Promise<void> => {
    if (!protocolNumber || !sectorId) return;
    
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
    isAccepting,
    refreshResponsible: loadSectorResponsible
  };
};
