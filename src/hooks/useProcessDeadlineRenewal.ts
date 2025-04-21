
import { useState } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

export const useProcessDeadlineRenewal = (onRenewalComplete?: () => void) => {
  const [isRenewing, setIsRenewing] = useState(false);
  const { updateProcessoHistorico } = useSupabase();
  const { toast } = useToast();

  const renewDeadline = async (processId: string, historyId: number) => {
    if (!historyId || isNaN(historyId)) {
      console.error("[renewDeadline] ID do histórico inválido:", historyId);
      toast({
        title: "Erro ao renovar prazo",
        description: "ID do histórico inválido. Contate o suporte.",
        variant: "destructive"
      });
      return;
    }

    console.log(`[renewDeadline] Iniciando renovação para processo ${processId}, historyId=${historyId}`);
    setIsRenewing(true);
    
    try {
      const now = new Date().toISOString();
      console.log(`[renewDeadline] Atualizando data_entrada para ${now}`);
      
      const { error, data } = await updateProcessoHistorico(historyId, {
        data_entrada: now
      });

      if (error) {
        console.error("[renewDeadline] Erro retornado pela API:", error);
        throw error;
      }

      console.log(`[renewDeadline] Renovação concluída com sucesso para historyId=${historyId}`, data);
      
      // Usando os dois métodos de toast para garantir que a mensagem seja exibida
      toast({
        title: "Prazo renovado com sucesso",
        description: "A data de entrada do processo foi atualizada.",
      });
      
      sonnerToast.success("Prazo renovado com sucesso", {
        description: "A data de entrada do processo foi atualizada."
      });

      if (onRenewalComplete) {
        console.log("[renewDeadline] Chamando callback de conclusão");
        onRenewalComplete();
      }
    } catch (error) {
      console.error("[renewDeadline] Erro ao renovar prazo:", error);
      
      toast({
        title: "Erro ao renovar prazo",
        description: "Não foi possível renovar o prazo do processo.",
        variant: "destructive"
      });
      
      sonnerToast.error("Erro ao renovar prazo", {
        description: "Não foi possível renovar o prazo do processo."
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
