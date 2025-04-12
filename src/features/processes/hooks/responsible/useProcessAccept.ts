
import { useCallback } from "react";
import { useSupabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { Process } from "@/types";

/**
 * Hook para gerenciar aceitação de responsabilidade por um processo
 */
export const useProcessAccept = (processId?: string, singleProcess: Process | null = null) => {
  const { user } = useAuth();
  const { supabase } = useSupabase();
  
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
  
  return { acceptProcess };
};
