
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";

export const useProcessRowResponsibility = (processId: string, sectorId?: string, processStatus?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();
  
  const requestMadeRef = useRef(false);

  const loadSectorResponsible = useCallback(async () => {
    // Se o processo não foi iniciado, pare a execução
    if (!sectorId || !processId || requestMadeRef.current || processStatus === 'not_started') {
      return;
    }
    
    requestMadeRef.current = true;
    setIsLoadingResponsible(true);
    
    try {
      const responsible = await getSectorResponsible(processId, sectorId, processStatus);
      setSectorResponsible(responsible);
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
      setSectorResponsible(null);
    } finally {
      setIsLoadingResponsible(false);
    }
  }, [processId, sectorId, processStatus, getSectorResponsible]);

  useEffect(() => {
    if (processId && sectorId && processStatus !== 'not_started') {
      requestMadeRef.current = false;
      loadSectorResponsible();
    }
    
    return () => {
      requestMadeRef.current = false;
    };
  }, [loadSectorResponsible, processId, sectorId, processStatus]);

  const handleAcceptResponsibility = useCallback(async (protocolNumber?: string) => {
    if (!user || !protocolNumber || !sectorId) return;
    
    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber);
      if (success) {
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

