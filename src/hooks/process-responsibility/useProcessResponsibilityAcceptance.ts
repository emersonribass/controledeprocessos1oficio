
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { saveDateToDatabase } from "@/utils/dateUtils";
import { useProcessVisibilityPermissions } from "@/hooks/process/permission/useProcessVisibilityPermissions";
import { Process } from "@/types";

export const useProcessResponsibilityAcceptance = (processes: Process[] = []) => {
  const [isAccepting, setIsAccepting] = useState<boolean>(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { refreshResponsibilityCache } = useProcessVisibilityPermissions(processes);

  const acceptProcessResponsibility = async (
    processId: string, 
    protocolNumber: string,
    showToast: boolean = false
  ) => {
    if (!user) {
      if (showToast) {
        uiToast({
          title: "Erro",
          description: "Você precisa estar logado para aceitar processos.",
          variant: "destructive",
        });
      }
      return false;
    }

    setIsAccepting(true);

    try {
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) throw processError;
      if (!processData) throw new Error("Processo não encontrado");

      const currentDepartmentId = processData.setor_atual;
      
      const { data: existingResponsibles, error: responsibleError } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', currentDepartmentId);

      if (responsibleError) throw responsibleError;

      const existingResponsible = existingResponsibles && existingResponsibles.length > 0 
        ? existingResponsibles[0] 
        : null;

      if (existingResponsible) {
        if (existingResponsible.usuario_id === user.id) {
          if (showToast) {
            uiToast({
              title: "Informação",
              description: "Você já é o responsável por este processo neste setor.",
            });
          }
          return true;
        }
        
        const now = saveDateToDatabase(new Date());

        const { error: updateError } = await supabase
          .from('setor_responsaveis')
          .update({ 
            usuario_id: user.id,
            data_atribuicao: now,
            updated_at: now
          })
          .eq('id', existingResponsible.id);

        if (updateError) throw updateError;
      } else {
        const now = saveDateToDatabase(new Date());
        
        const { error: insertError } = await supabase
          .from('setor_responsaveis')
          .insert({ 
            processo_id: processId,
            setor_id: currentDepartmentId,
            usuario_id: user.id,
            data_atribuicao: now,
            created_at: now,
            updated_at: now
          });

        if (insertError) throw insertError;
      }

      // Atualizar notificações
      const { error: notificationError } = await supabase
        .from('notificacoes')
        .update({ respondida: true })
        .eq('processo_id', processId)
        .eq('usuario_id', user.id)
        .eq('tipo', 'processo_movido');

      if (notificationError) {
        console.error("Erro ao atualizar notificações:", notificationError);
      }

      // Limpar o cache de responsabilidades para forçar nova verificação
      refreshResponsibilityCache();

      if (showToast) {
        toast.success(`Você aceitou a responsabilidade pelo processo ${protocolNumber} neste setor.`);
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao aceitar processo:", error);
      
      if (showToast) {
        uiToast({
          title: "Erro",
          description: "Não foi possível aceitar o processo.",
          variant: "destructive",
        });
      }
      return false;
    } finally {
      setIsAccepting(false);
    }
  };

  return {
    isAccepting,
    acceptProcessResponsibility
  };
};
