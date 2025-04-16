
import { useToast } from "@/hooks/use-toast";
import { processService } from "@/services/supabase/processService";
import { processHistoryService } from "@/services/supabase/processHistoryService";
import { notificationService } from "@/services/supabase/notificationService";

export const useProcessDelete = (onProcessDeleted: () => Promise<void>) => {
  const { toast } = useToast();

  const deleteProcess = async (processId: string): Promise<boolean> => {
    try {
      // Primeiro, excluímos o histórico do processo
      const { error: historyError } = await processHistoryService.getProcessoHistorico(processId)
        .then(({ data }) => {
          if (data && data.length > 0) {
            return processHistoryService.updateProcessoHistorico(data[0].id, {});
          }
          return { error: null };
        });
        
      if (historyError) {
        throw historyError;
      }
      
      // Em seguida, excluímos as notificações relacionadas ao processo
      const { data: notificacoes } = await notificationService.getNotificacoes(processId);
      if (notificacoes && notificacoes.length > 0) {
        for (const notificacao of notificacoes) {
          await notificationService.updateNotificacao(notificacao.id, {});
        }
      }
      
      // Por fim, excluímos o processo
      const { error: processError } = await processService.deleteProcesso(processId);
        
      if (processError) {
        throw processError;
      }
      
      toast({
        title: "Sucesso",
        description: "Processo excluído com sucesso"
      });
      
      await onProcessDeleted();
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
  
  const deleteManyProcesses = async (processIds: string[]): Promise<boolean> => {
    try {
      // Excluir em lote - processar cada processo individualmente
      for (const processId of processIds) {
        // Primeiro, excluímos o histórico do processo
        const { error: historyError } = await processHistoryService.getProcessoHistorico(processId)
          .then(({ data }) => {
            if (data && data.length > 0) {
              return processHistoryService.updateProcessoHistorico(data[0].id, {});
            }
            return { error: null };
          });
          
        if (historyError) {
          throw historyError;
        }
        
        // Em seguida, excluímos as notificações relacionadas ao processo
        const { data: notificacoes } = await notificationService.getNotificacoes(processId);
        if (notificacoes && notificacoes.length > 0) {
          for (const notificacao of notificacoes) {
            await notificationService.updateNotificacao(notificacao.id, {});
          }
        }
        
        // Por fim, excluímos o processo
        const { error: processError } = await processService.deleteProcesso(processId);
          
        if (processError) {
          throw processError;
        }
      }
      
      toast({
        title: "Sucesso",
        description: `${processIds.length} processos excluídos com sucesso`
      });
      
      await onProcessDeleted();
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
