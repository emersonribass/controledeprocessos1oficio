
import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";

export const useProcessDeadlineRenewal = (onRenewalComplete?: () => void) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const { updateProcessoHistorico } = useSupabase();
  const { toast } = useToast();

  const renewDeadline = async (processId: string, historyId: number) => {
    setIsRenewing(true);
    try {
      const { error } = await updateProcessoHistorico(historyId, {
        data_entrada: new Date().toISOString()
      });

      if (error) throw error;

      toast({
        title: "Prazo renovado com sucesso",
        description: "A data de entrada do processo foi atualizada.",
      });

      if (onRenewalComplete) {
        onRenewalComplete();
      }
    } catch (error) {
      console.error("Erro ao renovar prazo:", error);
      toast({
        title: "Erro ao renovar prazo",
        description: "Não foi possível renovar o prazo do processo.",
        variant: "destructive"
      });
    } finally {
      setIsRenewing(false);
    }
  };

  return {
    renewDeadline,
    isRenewing
  };
};
