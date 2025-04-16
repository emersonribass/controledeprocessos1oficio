
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";

export const useProcessRowResponsibility = (processId: string, sectorId?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  // Referência para controlar se a request já foi iniciada
  const requestMadeRef = useRef(false);

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = useCallback(async () => {
    if (!sectorId || !processId || requestMadeRef.current) {
      return;
    }
    
    requestMadeRef.current = true;
    setIsLoadingResponsible(true);
    
    try {
      const responsible = await getSectorResponsible(processId, sectorId);
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
      setSectorResponsible(null);
    } finally {
      setIsLoadingResponsible(false);
    }
  }, [processId, sectorId, getSectorResponsible]);

  // Carrega o responsável quando o componente é montado ou quando o departamento atual muda
  useEffect(() => {
    if (processId && sectorId) {
      // Reset do estado quando os IDs mudam
      requestMadeRef.current = false;
      loadSectorResponsible();
    }
    
    return () => {
      requestMadeRef.current = false;
    };
  }, [loadSectorResponsible, processId, sectorId]);

  // Função para aceitar a responsabilidade pelo processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber?: string) => {
    if (!user || !protocolNumber || !sectorId) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
        // Redefinir estado para forçar nova busca
        requestMadeRef.current = false;
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
    isAccepting
  };
};
