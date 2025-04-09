
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useSupabaseProcesses = () => {
  const { 
    processes, 
    isLoading, 
    fetchProcesses 
  } = useProcessesFetch();
  
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment 
  } = useProcessMovement(processes);
  
  const { 
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();
  
  const { departments } = useDepartmentsData();
  const { toast } = useToast();
  const { user } = useAuth();

  const handleMoveProcessToNextDepartment = async (processId: string) => {
    const success = await moveProcessToNextDepartment(processId);
    if (success) {
      await fetchProcesses();
    }
  };

  const handleMoveProcessToPreviousDepartment = async (processId: string) => {
    const success = await moveProcessToPreviousDepartment(processId);
    if (success) {
      await fetchProcesses();
    }
  };

  const handleUpdateProcessType = async (processId: string, newTypeId: string) => {
    try {
      await updateProcessType(processId, newTypeId);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      throw error;
    }
  };

  const handleUpdateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => {
    try {
      await updateProcessStatus(processId, newStatus);
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar status do processo:', error);
      throw error;
    }
  };
  
  const startProcess = async (processId: string) => {
    try {
      const firstDept = departments.find(d => d.order === 1);
      
      if (!firstDept) {
        throw new Error("Setor de atendimento não encontrado");
      }
      
      const now = new Date().toISOString();
      
      if (!user || !user.id) {
        throw new Error("Usuário não autenticado");
      }
      
      const { error: updateError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: firstDept.id,
          status: "Em andamento",
          data_inicio: now,
          updated_at: now
        })
        .eq('id', processId);
        
      if (updateError) {
        throw updateError;
      }
      
      const { error: historyError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: firstDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id
        });
        
      if (historyError) {
        throw historyError;
      }
      
      toast({
        title: "Sucesso",
        description: `Processo iniciado e movido para ${firstDept.name}`
      });
      
      await fetchProcesses();
      
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo.",
        variant: "destructive"
      });
      throw error;
    }
  };

  // Nova função para excluir um processo
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
      
      await fetchProcesses();
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

  // Nova função para excluir múltiplos processos de uma vez
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
      
      await fetchProcesses();
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
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    updateProcessType: handleUpdateProcessType,
    updateProcessStatus: handleUpdateProcessStatus,
    startProcess,
    deleteProcess,
    deleteManyProcesses
  };
};
