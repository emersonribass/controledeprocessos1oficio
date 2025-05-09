
import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";
import { useProcesses } from "./useProcesses";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const { getSectorResponsible, getProcessResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [process, setProcess] = useState<any>(null);
  const { toast } = useToast();
  const { getProcess } = useProcesses();
  const { user } = useAuth();

  // Carregar o processo
  useEffect(() => {
    const loadProcess = async () => {
      if (!processId) return;
      try {
        const processData = await getProcess(processId);
        setProcess(processData);
      } catch (error) {
        console.error("Erro ao carregar processo:", error);
      }
    };
    
    loadProcess();
  }, [processId, getProcess]);

  // Carregar os responsáveis quando o componente é montado
  useEffect(() => {
    const loadResponsibles = async () => {
      if (!processId || !sectorId) {
        setIsLoading(false);
        return;
      }

      try {
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
    };

    loadResponsibles();
  }, [processId, sectorId, getProcessResponsible, getSectorResponsible]);

  // Função para aceitar a responsabilidade
  const handleAcceptResponsibility = useCallback(async (protocolNumber?: string) => {
    if (!user || !processId || !protocolNumber) return;

    try {
      const success = await acceptProcessResponsibility(processId, protocolNumber, true);
      
      if (success) {
        // Atualizar o responsável do setor após aceitar
        const updatedSectorResponsible = await getSectorResponsible(processId, sectorId);
        setSectorResponsible(updatedSectorResponsible);
      }
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade pelo processo:", error);
      toast({
        title: "Erro",
        description: "Não foi possível aceitar a responsabilidade pelo processo.",
        variant: "destructive"
      });
    }
  }, [processId, sectorId, user, acceptProcessResponsibility, getSectorResponsible, toast]);

  return {
    isLoading,
    processResponsible,
    sectorResponsible,
    handleAcceptResponsibility,
    isAccepting,
    process
  };
};
