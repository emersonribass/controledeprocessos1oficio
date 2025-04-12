
import { useState, useCallback } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";

/**
 * Hook para gerenciar responsabilidade de um único processo
 */
export const useSingleProcessResponsible = (processId?: string) => {
  const { user } = useAuth();
  
  const [singleProcess, setSingleProcess] = useState<Process | null>(null);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | null>(null);
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | null>(null);

  const fetchSingleProcessResponsibility = useCallback(async () => {
    if (!processId || !user) return;
    
    try {
      // Buscar dados do processo
      const { data, error } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSingleProcess(data as unknown as Process);
        
        // Verificar se o usuário é o responsável principal
        setIsMainResponsible(data.usuario_responsavel === user.id);
        
        // Buscar nome do responsável principal se existir
        if (data.usuario_responsavel) {
          const { data: userData, error: userError } = await supabase
            .from('usuarios')
            .select('nome, email')
            .eq('id', data.usuario_responsavel)
            .single();
          
          if (!userError && userData) {
            setMainResponsibleUserName(userData.nome || userData.email);
          }
        }
        
        // Buscar responsável de departamento
        const { data: historicoAtual, error: historicoError } = await supabase
          .from('processos_historico')
          .select('*')
          .eq('processo_id', processId)
          .eq('setor_id', data.setor_atual)
          .is('data_saida', null)
          .maybeSingle();
        
        if (!historicoError && historicoAtual) {
          // Verificar se o usuário é responsável de setor
          setIsSectorResponsible(historicoAtual.usuario_responsavel_setor === user.id);
          
          // Buscar nome do responsável de setor
          if (historicoAtual.usuario_responsavel_setor) {
            const { data: sectorUserData, error: sectorUserError } = await supabase
              .from('usuarios')
              .select('nome, email')
              .eq('id', historicoAtual.usuario_responsavel_setor)
              .single();
            
            if (!sectorUserError && sectorUserData) {
              setSectorResponsibleUserName(sectorUserData.nome || sectorUserData.email);
            }
          }
        } else {
          setIsSectorResponsible(false);
          setSectorResponsibleUserName(null);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar responsabilidade do processo:", error);
    }
  }, [processId, user]);

  return {
    singleProcess,
    isMainResponsible,
    isSectorResponsible,
    mainResponsibleUserName,
    sectorResponsibleUserName,
    fetchSingleProcessResponsibility,
    hasResponsibleUser: Boolean(singleProcess?.responsibleUser) || Boolean(sectorResponsibleUserName)
  };
};
