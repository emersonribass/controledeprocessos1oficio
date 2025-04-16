
import { useState, useEffect, useCallback } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { useToast } from "./use-toast";
import { useAuth } from "./auth";
import { useProcesses } from "./useProcesses";
import { supabase } from "@/integrations/supabase/client";

export const useProcessRowResponsibility = (processId: string, sectorId?: string) => {
  const { getSectorResponsible, acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const [isLoadingResponsible, setIsLoadingResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  // Verifica se o usuário atual é responsável pelo processo no setor especificado
  const checkUserResponsibilityForSector = useCallback(async () => {
    if (!user || !sectorId || !processId) return false;
    
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar responsabilidade pelo setor:", error);
        return false;
      }
      
      setIsSectorResponsible(!!data);
      return !!data;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade:", error);
      return false;
    }
  }, [user, sectorId, processId]);

  // Carrega o responsável pelo processo no setor atual
  const loadSectorResponsible = useCallback(async () => {
    if (!sectorId || !processId) {
      setSectorResponsible(null);
      return;
    }
    
    setIsLoadingResponsible(true);
    try {
      const responsible = await getSectorResponsible(processId, sectorId);
      setSectorResponsible(responsible);
      
      // Verifica se o usuário atual é responsável
      await checkUserResponsibilityForSector();
    } catch (error) {
      console.error("Erro ao carregar responsável:", error);
      setSectorResponsible(null);
    } finally {
      setIsLoadingResponsible(false);
    }
  }, [processId, sectorId, getSectorResponsible, checkUserResponsibilityForSector]);

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
    isSectorResponsible
  };
};
