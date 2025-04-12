
import { useState, useEffect } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";

export const useProcessRowResponsibility = (processId: string, currentDepartment?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = async () => {
    if (!currentDepartment) return;
    
    setIsLoadingResponsible(true);
    try {
      const responsible = await getSectorResponsible(processId, currentDepartment);
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
    } finally {
      setIsLoadingResponsible(false);
    }
  };

  // Carrega o responsável quando o componente é montado ou quando o departamento atual muda
  useEffect(() => {
    loadSectorResponsible();
  }, [processId, currentDepartment]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = async (protocolNumber?: string) => {
    if (!user || !protocolNumber || !currentDepartment) return;
    
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
