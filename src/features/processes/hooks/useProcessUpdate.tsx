
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProcessUpdate = () => {
  // Função para atualizar o tipo de um processo
  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from("processos")
        .update({ tipo_processo: newTypeId })
        .eq("id", processId);

      if (error) {
        throw error;
      }

      toast.success("Tipo de processo atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar tipo de processo:", error);
      toast.error("Erro ao atualizar tipo de processo");
      throw error;
    }
  };

  // Função para atualizar o status de um processo
  const updateProcessStatus = async (
    processId: string,
    newStatus: "Em andamento" | "Concluído" | "Não iniciado"
  ): Promise<void> => {
    try {
      const { error } = await supabase
        .from("processos")
        .update({ status: newStatus })
        .eq("id", processId);

      if (error) {
        throw error;
      }

      toast.success("Status do processo atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar status do processo:", error);
      toast.error("Erro ao atualizar status do processo");
      throw error;
    }
  };

  return {
    updateProcessType,
    updateProcessStatus
  };
};
