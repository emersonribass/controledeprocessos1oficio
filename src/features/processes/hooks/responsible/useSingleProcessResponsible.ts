
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
        .from('processes')
        .select('*')
        .eq('id', processId)
        .single();
      
      if (error) throw error;
      
      if (data) {
        setSingleProcess(data as unknown as Process);
        
        // Verificar se o usuário é o responsável principal
        setIsMainResponsible(data.responsibleUser === user.id);
        
        // Buscar nome do responsável principal se existir
        if (data.responsibleUser) {
          const { data: userData, error: userError } = await supabase
            .from('users')
            .select('name, email')
            .eq('id', data.responsibleUser)
            .single();
          
          if (!userError && userData) {
            setMainResponsibleUserName(userData.name || userData.email);
          }
        }
        
        // Buscar responsáveis de departamento
        const { data: sectorResponsibles, error: sectorError } = await supabase
          .from('department_responsibles')
          .select('*')
          .eq('process_id', processId)
          .eq('department_id', data.currentDepartment);
        
        if (!sectorError && sectorResponsibles?.length) {
          const sectorResp = sectorResponsibles[0];
          
          // Verificar se o usuário é responsável de setor
          setIsSectorResponsible(sectorResp.user_id === user.id);
          
          // Buscar nome do responsável de setor
          if (sectorResp.user_id) {
            const { data: sectorUserData, error: sectorUserError } = await supabase
              .from('users')
              .select('name, email')
              .eq('id', sectorResp.user_id)
              .single();
            
            if (!sectorUserError && sectorUserData) {
              setSectorResponsibleUserName(sectorUserData.name || sectorUserData.email);
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
