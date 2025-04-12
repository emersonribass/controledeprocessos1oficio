
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProcessDelete = () => {
  const [isDeleting, setIsDeleting] = useState(false);

  // Função para excluir um processo
  const deleteProcess = async (processId: string): Promise<boolean> => {
    try {
      setIsDeleting(true);

      // 1. Primeiro excluir os registros de histórico relacionados ao processo
      const { error: historicoError } = await supabase
        .from("processos_historico")
        .delete()
        .eq("processo_id", processId);

      if (historicoError) {
        console.error("Erro ao excluir histórico do processo:", historicoError);
        toast.error("Erro ao excluir histórico do processo");
        return false;
      }

      // 2. Excluir notificações relacionadas ao processo
      const { error: notificacoesError } = await supabase
        .from("notificacoes")
        .delete()
        .eq("processo_id", processId);

      if (notificacoesError) {
        console.error("Erro ao excluir notificações do processo:", notificacoesError);
        toast.error("Erro ao excluir notificações do processo");
        return false;
      }

      // 3. Finalmente excluir o processo
      const { error: processoError } = await supabase
        .from("processos")
        .delete()
        .eq("id", processId);

      if (processoError) {
        console.error("Erro ao excluir processo:", processoError);
        toast.error("Erro ao excluir processo");
        return false;
      }

      toast.success("Processo excluído com sucesso");
      return true;
    } catch (error) {
      console.error("Erro ao excluir processo:", error);
      toast.error("Erro ao excluir processo");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  // Função para excluir vários processos
  const deleteManyProcesses = async (processIds: string[]): Promise<boolean> => {
    try {
      setIsDeleting(true);

      // 1. Primeiro excluir os registros de histórico relacionados aos processos
      const { error: historicoError } = await supabase
        .from("processos_historico")
        .delete()
        .in("processo_id", processIds);

      if (historicoError) {
        console.error("Erro ao excluir histórico dos processos:", historicoError);
        toast.error("Erro ao excluir histórico dos processos");
        return false;
      }

      // 2. Excluir notificações relacionadas aos processos
      const { error: notificacoesError } = await supabase
        .from("notificacoes")
        .delete()
        .in("processo_id", processIds);

      if (notificacoesError) {
        console.error("Erro ao excluir notificações dos processos:", notificacoesError);
        toast.error("Erro ao excluir notificações dos processos");
        return false;
      }

      // 3. Finalmente excluir os processos
      const { error: processoError } = await supabase
        .from("processos")
        .delete()
        .in("id", processIds);

      if (processoError) {
        console.error("Erro ao excluir processos:", processoError);
        toast.error("Erro ao excluir processos");
        return false;
      }

      toast.success(`${processIds.length} processos excluídos com sucesso`);
      return true;
    } catch (error) {
      console.error("Erro ao excluir processos:", error);
      toast.error("Erro ao excluir processos");
      return false;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    isDeleting,
    deleteProcess,
    deleteManyProcesses
  };
};
