
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

export const useProcessResponsibleAssignment = () => {
  const [isAssigning, setIsAssigning] = useState<boolean>(false);
  const { toast: uiToast } = useToast();

  /**
   * Atribui um usuário como responsável por um processo
   */
  const assignResponsible = async (processId: string, userId: string) => {
    if (!userId) {
      uiToast({
        title: "Erro",
        description: "ID do usuário não informado.",
        variant: "destructive",
      });
      return false;
    }

    setIsAssigning(true);

    try {
      const { error } = await supabase
        .from('processos')
        .update({ usuario_responsavel: userId })
        .eq('id', processId);

      if (error) {
        throw error;
      }

      toast.success("Responsável atribuído com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao atribuir responsável:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível atribuir o responsável.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsAssigning(false);
    }
  };

  return {
    isAssigning,
    assignResponsible
  };
};
