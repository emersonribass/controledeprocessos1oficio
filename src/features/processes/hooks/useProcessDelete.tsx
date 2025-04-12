
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useErrorHandler } from "@/hooks/useErrorHandler";

export const useProcessDelete = () => {
  const { handleError } = useErrorHandler();

  // Função para excluir um processo
  const deleteProcess = async (processId: string) => {
    try {
      // Primeiro, excluímos o histórico do processo
      const { error: historyError } = await supabase
        .from('processos_historico')
        .delete()
        .eq('processo_id', processId);
        
      if (historyError) throw historyError;
      
      // Em seguida, excluímos as notificações relacionadas ao processo
      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .delete()
        .eq('processo_id', processId);
        
      if (notificationsError) throw notificationsError;
      
      // Por fim, excluímos o processo
      const { error: processError } = await supabase
        .from('processos')
        .delete()
        .eq('id', processId);
        
      if (processError) throw processError;
      
      toast.success("Sucesso", {
        description: "Processo excluído com sucesso"
      });
      
      return true;
    } catch (error) {
      handleError(error, {
        showToast: true,
        toastDuration: 4000,
        logError: true
      });
      return false;
    }
  };

  // Função para excluir múltiplos processos de uma vez
  const deleteManyProcesses = async (processIds: string[]) => {
    try {
      // Primeiro, excluímos o histórico dos processos
      const { error: historyError } = await supabase
        .from('processos_historico')
        .delete()
        .in('processo_id', processIds);
        
      if (historyError) throw historyError;
      
      // Em seguida, excluímos as notificações relacionadas aos processos
      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .delete()
        .in('processo_id', processIds);
        
      if (notificationsError) throw notificationsError;
      
      // Por fim, excluímos os processos
      const { error: processError } = await supabase
        .from('processos')
        .delete()
        .in('id', processIds);
        
      if (processError) throw processError;
      
      toast.success("Sucesso", {
        description: `${processIds.length} processos excluídos com sucesso`
      });
      
      return true;
    } catch (error) {
      handleError(error, {
        showToast: true,
        toastDuration: 4000,
      });
      return false;
    }
  };

  return {
    deleteProcess,
    deleteManyProcesses
  };
};
