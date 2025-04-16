
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

export const useProcessDelete = (onProcessUpdated: () => void) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  /**
   * Exclui um processo
   */
  const deleteProcess = async (processId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsDeleting(true);
    try {
      // Primeiro, excluir histórico do processo
      const { data: historico, error: historicoError } = await supabase
        .from('processos_historico')
        .select('id')
        .eq('processo_id', processId);

      if (historicoError) throw historicoError;

      if (historico && historico.length > 0) {
        const { error: deleteHistoryError } = await supabase
          .from('processos_historico')
          .delete()
          .eq('processo_id', processId);

        if (deleteHistoryError) throw deleteHistoryError;
      }
      
      // Excluir responsáveis de setor
      const { error: deleteResponsiblesError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId);

      if (deleteResponsiblesError) {
        console.error("Erro ao excluir responsáveis de setor:", deleteResponsiblesError);
        // Não crítico, podemos continuar
      }
      
      // Excluir notificações relacionadas
      const { error: deleteNotificationsError } = await supabase
        .from('notificacoes')
        .delete()
        .eq('processo_id', processId);

      if (deleteNotificationsError) {
        console.error("Erro ao excluir notificações:", deleteNotificationsError);
        // Não crítico, podemos continuar
      }
      
      // Por fim, excluir o processo
      const { error: deleteProcessError } = await supabase
        .from('processos')
        .delete()
        .eq('id', processId);

      if (deleteProcessError) throw deleteProcessError;

      onProcessUpdated();
      uiToast({
        title: "Sucesso",
        description: "Processo excluído com sucesso"
      });
      return true;
    } catch (error) {
      console.error("Erro ao excluir processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível excluir o processo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };
  
  /**
   * Exclui vários processos de uma vez
   */
  const deleteManyProcesses = async (processIds: string[]): Promise<boolean> => {
    if (!user || !processIds.length) return false;
    
    setIsDeleting(true);
    try {
      for (const processId of processIds) {
        // Excluir histórico do processo
        const { error: deleteHistoryError } = await supabase
          .from('processos_historico')
          .delete()
          .eq('processo_id', processId);

        if (deleteHistoryError) {
          console.error(`Erro ao excluir histórico do processo ${processId}:`, deleteHistoryError);
        }
        
        // Excluir responsáveis de setor
        const { error: deleteResponsiblesError } = await supabase
          .from('setor_responsaveis')
          .delete()
          .eq('processo_id', processId);

        if (deleteResponsiblesError) {
          console.error(`Erro ao excluir responsáveis do processo ${processId}:`, deleteResponsiblesError);
        }
        
        // Excluir notificações relacionadas
        const { error: deleteNotificationsError } = await supabase
          .from('notificacoes')
          .delete()
          .eq('processo_id', processId);

        if (deleteNotificationsError) {
          console.error(`Erro ao excluir notificações do processo ${processId}:`, deleteNotificationsError);
        }
      }
      
      // Excluir todos os processos de uma vez
      const { error: deleteProcessesError } = await supabase
        .from('processos')
        .delete()
        .in('id', processIds);

      if (deleteProcessesError) throw deleteProcessesError;

      onProcessUpdated();
      uiToast({
        title: "Sucesso",
        description: `${processIds.length} processos excluídos com sucesso`
      });
      return true;
    } catch (error) {
      console.error("Erro ao excluir processos em lote:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível excluir os processos selecionados.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteProcess,
    deleteManyProcesses
  };
};
