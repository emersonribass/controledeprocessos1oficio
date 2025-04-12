
import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { Process } from "@/types";

/**
 * Hook para gerenciar aceitação de responsabilidade por um processo
 */
export const useProcessAccept = (processId?: string, singleProcess: Process | null = null) => {
  const { user } = useAuth();
  
  const acceptProcess = useCallback(async (): Promise<boolean> => {
    if (!user || !processId || !singleProcess) return false;
    
    try {
      // Verificar se já existe um responsável
      const { data: existingResp, error: checkError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', singleProcess.currentDepartment)
        .is('data_saida', null)
        .maybeSingle();
      
      if (checkError) throw checkError;
      
      if (existingResp) {
        // Atualizar responsável existente
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ usuario_responsavel_setor: user.id })
          .eq('id', existingResp.id);
        
        if (updateError) throw updateError;
      } else {
        // Criar novo registro de responsável
        const { error: insertError } = await supabase
          .from('processos_historico')
          .insert({
            processo_id: processId,
            setor_id: singleProcess.currentDepartment,
            usuario_id: null,
            usuario_responsavel_setor: user.id
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
  }, [user, processId, singleProcess]);
  
  return { acceptProcess };
};
