
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabase";
import { supabase } from "@/integrations/supabase/client";

export const useProcessUpdate = () => {
  const { toast } = useToast();

  const updateProcessType = async (processId: string, newTypeId: string) => {
    try {
      // Atualizar o tipo de processo
      const { error } = await supabase
        .from("processos")
        .update({ tipo_processo: newTypeId, updated_at: new Date().toISOString() })
        .eq("id", processId);

      if (error) {
        console.error("Erro ao atualizar tipo:", error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Tipo de processo atualizado com sucesso."
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo.",
        variant: "destructive"
      });
      return false;
    }
  };

  const updateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') => {
    try {
      // Atualizar o status do processo
      const { error } = await supabase
        .from("processos")
        .update({ 
          status: newStatus, 
          updated_at: new Date().toISOString() 
        })
        .eq("id", processId);

      if (error) {
        console.error("Erro ao atualizar status:", error);
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Status atualizado para "${newStatus}".`
      });

      return true;
    } catch (error) {
      console.error('Erro ao atualizar status do processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do processo.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    updateProcessType,
    updateProcessStatus
  };
};
