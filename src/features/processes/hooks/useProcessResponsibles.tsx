
import { useEffect, useState, useCallback } from "react";
import { Process } from "@/types";
import { useAuth } from "@/features/auth";
import { useSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface ProcessResponsiblesHookResult {
  processResponsibles: Record<string, string | null>;
  setProcessResponsibles?: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
  hasProcessResponsible: (processId: string) => boolean;
  isUserProcessResponsible: (processId: string) => boolean;
  isMainResponsible: boolean;
  isSectorResponsible: boolean;
  hasResponsibleUser: boolean;
  mainResponsibleUserName: string | null;
  sectorResponsibleUserName: string | null;
  refreshResponsibility: () => Promise<void>;
  acceptProcess: () => Promise<boolean>;
}

interface UseProcessResponsiblesProps {
  processes?: Process[];
  processId?: string;
}

export const useProcessResponsibles = ({ 
  processes = [], 
  processId 
}: UseProcessResponsiblesProps): ProcessResponsiblesHookResult => {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  
  // Estado para armazenar os responsáveis por processo
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, string | null>>({});
  
  // Estado para dados do processo único quando processId é fornecido
  const [singleProcess, setSingleProcess] = useState<Process | null>(null);
  const [isMainResponsible, setIsMainResponsible] = useState(false);
  const [isSectorResponsible, setIsSectorResponsible] = useState(false);
  const [mainResponsibleUserName, setMainResponsibleUserName] = useState<string | null>(null);
  const [sectorResponsibleUserName, setSectorResponsibleUserName] = useState<string | null>(null);
  
  // Memoizar a função para evitar recriá-la em cada renderização
  const hasProcessResponsible = useCallback((processId: string): boolean => {
    return Boolean(processResponsibles[processId]);
  }, [processResponsibles]);
  
  // Memoizar a função para evitar recriá-la em cada renderização
  const isUserProcessResponsible = useCallback((processId: string): boolean => {
    if (!user) return false;
    return processResponsibles[processId] === user.id;
  }, [processResponsibles, user]);
  
  // Buscar dados de responsabilidade para um processo específico
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
  }, [processId, user, supabase]);
  
  // Buscar responsáveis para vários processos
  const fetchMultipleProcessResponsibles = useCallback(async () => {
    if (!processes.length) return;
    
    try {
      const processIds = processes.map(p => p.id);
      const { data, error } = await supabase
        .from('department_responsibles')
        .select('*')
        .in('process_id', processIds);
      
      if (error) throw error;
      
      const newResponsibles: Record<string, string | null> = {};
      if (data) {
        data.forEach(item => {
          newResponsibles[item.process_id] = item.user_id;
        });
      }
      
      setProcessResponsibles(newResponsibles);
    } catch (error) {
      console.error("Erro ao buscar responsáveis dos processos:", error);
    }
  }, [processes, supabase]);
  
  // Função para aceitar responsabilidade por um processo
  const acceptProcess = useCallback(async (): Promise<boolean> => {
    if (!user || !processId || !singleProcess) return false;
    
    try {
      // Verificar se já existe um responsável
      const { data: existingResp, error: checkError } = await supabase
        .from('department_responsibles')
        .select('*')
        .eq('process_id', processId)
        .eq('department_id', singleProcess.currentDepartment);
      
      if (checkError) throw checkError;
      
      if (existingResp && existingResp.length > 0) {
        // Atualizar responsável existente
        const { error: updateError } = await supabase
          .from('department_responsibles')
          .update({ user_id: user.id })
          .eq('process_id', processId)
          .eq('department_id', singleProcess.currentDepartment);
        
        if (updateError) throw updateError;
      } else {
        // Criar novo registro de responsável
        const { error: insertError } = await supabase
          .from('department_responsibles')
          .insert({
            process_id: processId,
            department_id: singleProcess.currentDepartment,
            user_id: user.id
          });
        
        if (insertError) throw insertError;
      }
      
      toast.success("Processo aceito com sucesso", {
        description: "Você agora é responsável por este processo."
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      toast.error("Erro ao aceitar processo", {
        description: "Não foi possível registrar você como responsável."
      });
      return false;
    }
  }, [user, processId, singleProcess, supabase]);
  
  // Função para atualizar os dados de responsabilidade
  const refreshResponsibility = useCallback(async () => {
    if (processId) {
      await fetchSingleProcessResponsibility();
    } else {
      await fetchMultipleProcessResponsibles();
    }
  }, [processId, fetchSingleProcessResponsibility, fetchMultipleProcessResponsibles]);
  
  useEffect(() => {
    refreshResponsibility();
  }, [refreshResponsibility]);
  
  return {
    processResponsibles,
    setProcessResponsibles: processes.length ? setProcessResponsibles : undefined,
    hasProcessResponsible,
    isUserProcessResponsible,
    isMainResponsible,
    isSectorResponsible,
    hasResponsibleUser: Boolean(singleProcess?.responsibleUser) || Boolean(sectorResponsibleUserName),
    mainResponsibleUserName,
    sectorResponsibleUserName,
    refreshResponsibility,
    acceptProcess
  };
};
