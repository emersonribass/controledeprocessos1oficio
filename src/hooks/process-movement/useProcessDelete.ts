
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessDelete = (onProcessUpdated: () => void) => {
  const { toast } = useToast();

  const deleteProcess = async (processId: string) => {
    try {
      // Primeiro, excluímos o histórico do processo
      const { error: historyError } = await supabase
        .from('processos_historico')
        .delete()
        .eq('processo_id', processId);
        
      if (historyError) {
        throw historyError;
      }
      
      // Em seguida, excluímos as notificações relacionadas ao processo
      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .delete()
        .eq('processo_id', processId);
        
      if (notificationsError) {
        throw notificationsError;
      }
      
      // Por fim, excluímos o processo
      const { error: processError } = await supabase
        .from('processos')
        .delete()
        .eq('id', processId);
        
      if (processError) {
        throw processError;
      }
      
      toast({
        title: "Sucesso",
        description: "Processo excluído com sucesso"
      });
      
      onProcessUpdated();
      return true;
    } catch (error) {
      console.error('Erro ao excluir processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o processo.",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteManyProcesses = async (processIds: string[]) => {
    try {
      // Primeiro, excluímos o histórico dos processos
      const { error: historyError } = await supabase
        .from('processos_historico')
        .delete()
        .in('processo_id', processIds);
        
      if (historyError) {
        throw historyError;
      }
      
      // Em seguida, excluímos as notificações relacionadas aos processos
      const { error: notificationsError } = await supabase
        .from('notificacoes')
        .delete()
        .in('processo_id', processIds);
        
      if (notificationsError) {
        throw notificationsError;
      }
      
      // Por fim, excluímos os processos
      const { error: processError } = await supabase
        .from('processos')
        .delete()
        .in('id', processIds);
        
      if (processError) {
        throw processError;
      }
      
      toast({
        title: "Sucesso",
        description: `${processIds.length} processos excluídos com sucesso`
      });
      
      onProcessUpdated();
      return true;
    } catch (error) {
      console.error('Erro ao excluir processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir os processos selecionados.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    deleteProcess,
    deleteManyProcesses
  };
};
