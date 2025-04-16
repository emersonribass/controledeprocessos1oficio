
import { useState, useEffect, useCallback, useRef } from "react";
import { useProcessResponsibility } from "./useProcessResponsibility";
import { supabase } from "@/integrations/supabase/client";

export const useProcessDetailsResponsibility = (processId: string, sectorId: string) => {
  const [isLoading, setIsLoading] = useState(true);
  const [processResponsible, setProcessResponsible] = useState<any>(null);
  const [sectorResponsible, setSectorResponsible] = useState<any>(null);
  const { acceptProcessResponsibility, isAccepting } = useProcessResponsibility();
  
  // Referências para controlar se os dados já foram carregados
  const loadedRef = useRef(false);
  const loadingInProgressRef = useRef(false);
  
  // Função otimizada para buscar responsáveis
  const loadResponsibles = useCallback(async () => {
    if (!processId || !sectorId || loadingInProgressRef.current) {
      return;
    }
    
    // Evitar múltiplas chamadas simultâneas
    loadingInProgressRef.current = true;
    setIsLoading(true);
    
    try {
      // Buscamos todos os responsáveis de uma vez
      const { data: responsibleData, error: responsibleError } = await supabase
        .from('processos')
        .select(`
          id,
          usuario_responsavel,
          setor_responsaveis(
            id,
            usuario_id,
            setor_id
          ),
          usuarios!processos_usuario_responsavel_fkey(
            id,
            nome,
            email
          )
        `)
        .eq('id', processId)
        .single();
      
      if (responsibleError) {
        throw responsibleError;
      }
      
      // Processo responsável
      setProcessResponsible(
        responsibleData?.usuario_responsavel ? 
        responsibleData.usuarios : null
      );
      
      // Responsável pelo setor
      const sectorResp = responsibleData?.setor_responsaveis?.find(
        (sr: any) => sr.setor_id === sectorId
      );
      
      if (sectorResp?.usuario_id) {
        // Buscar detalhes do usuário responsável pelo setor
        const { data: userData, error: userError } = await supabase
          .from('usuarios')
          .select('id, nome, email')
          .eq('id', sectorResp.usuario_id)
          .single();
        
        if (userError) {
          console.error("Erro ao buscar detalhes do usuário:", userError);
          setSectorResponsible(null);
        } else {
          setSectorResponsible(userData);
        }
      } else {
        setSectorResponsible(null);
      }
      
      loadedRef.current = true;
    } catch (error) {
      console.error("Erro ao carregar responsáveis:", error);
      setProcessResponsible(null);
      setSectorResponsible(null);
    } finally {
      setIsLoading(false);
      loadingInProgressRef.current = false;
    }
  }, [processId, sectorId]);

  // Aceitar responsabilidade pelo processo
  const handleAcceptResponsibility = useCallback(async (protocolNumber: string): Promise<void> => {
    if (!processId || !protocolNumber) return;
    
    const success = await acceptProcessResponsibility(processId, protocolNumber);
    if (success) {
      await loadResponsibles();
    }
  }, [processId, acceptProcessResponsibility, loadResponsibles]);

  // Carregar responsáveis quando os IDs mudarem
  useEffect(() => {
    // Resetar o estado quando os IDs mudam
    if (processId && sectorId) {
      loadedRef.current = false;
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
