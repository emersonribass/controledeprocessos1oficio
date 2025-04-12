
import { useToast } from "@/hooks/use-toast";
import { supabaseService } from "@/services/supabase";

export const useProcessUpdate = () => {
  const { toast } = useToast();

  const updateProcessType = async (processId: string, newTypeId: string) => {
    try {
      // Atualizar o tipo de processo
      const { error } = await supabaseService.updateProcessTypeById(processId, newTypeId);

      if (error) {
        throw error;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o tipo de processo.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const updateProcessStatus = async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => {
    try {
      // Atualizar o status do processo
      const { error } = await supabaseService.updateProcessStatus(processId, newStatus);

      if (error) {
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
      throw error;
    }
  };

  return {
    updateProcessType,
    updateProcessStatus
  };
};
