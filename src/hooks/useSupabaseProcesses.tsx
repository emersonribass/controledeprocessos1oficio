
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

  return {
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment: handleMoveProcessToNextDepartment,
    moveProcessToPreviousDepartment: handleMoveProcessToPreviousDepartment,
    updateProcessType: handleUpdateProcessType,
    updateProcessStatus: handleUpdateProcessStatus,
    startProcess
  };
};
