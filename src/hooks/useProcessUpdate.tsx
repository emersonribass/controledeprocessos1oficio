
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessUpdate = () => {
  const { toast } = useToast();

  const updateProcessType = async (processId: string, newTypeId: string) => {
    try {
      const now = new Date().toISOString();

      // Atualizar o tipo de processo
      const { error } = await supabase
        .from('processos')
        .update({ 
          tipo_processo: newTypeId,
          updated_at: now
        })
        .eq('id', processId);

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

  return {
    updateProcessType
  };
};
