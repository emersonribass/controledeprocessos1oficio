import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/features/auth";
import { toast } from "sonner";
import { useNotificationsService } from "@/features/notifications/hooks/useNotificationsService";

export const useNextDepartment = () => {
  const { user } = useAuth();
  const { notifyDepartmentUsers } = useNotificationsService();

  const moveToNextDepartment = async (processId: string): Promise<boolean> => {
    try {
      if (!user) {
        toast.error("Usuário não autenticado");
        return false;
      }

      // 1. Obter informações do processo
      const { data: processo, error: processoError } = await supabase
        .from("processos")
        .select("setor_atual, numero_protocolo")
        .eq("id", processId)
        .single();

      if (processoError || !processo) {
        console.error("Erro ao obter informações do processo:", processoError);
        toast.error("Erro ao mover processo");
        return false;
      }

      // 2. Obter todos os setores para calcular o próximo
      const { data: setores, error: setoresError } = await supabase
        .from("setores")
        .select("id, name, order_num")
        .order("order_num", { ascending: true });

      if (setoresError || !setores) {
        console.error("Erro ao obter setores:", setoresError);
        toast.error("Erro ao mover processo");
        return false;
      }

      // 3. Encontrar o departamento atual e o próximo
      const departamentoAtual = setores.find(s => s.id.toString() === processo.setor_atual);
      if (!departamentoAtual) {
        toast.error("Setor atual não encontrado");
        return false;
      }

      const proximos = setores.filter(s => s.order_num > departamentoAtual.order_num)
        .sort((a, b) => a.order_num - b.order_num);

      if (proximos.length === 0) {
        toast.error("Não há próximo setor disponível");
        return false;
      }

      const proximoDepartamento = proximos[0];

      // 4. Marcar data de saída no histórico atual
      const now = new Date().toISOString();
      const { error: updateHistoricoError } = await supabase
        .from("processos_historico")
        .update({ data_saida: now })
        .eq("processo_id", processId)
        .eq("setor_id", processo.setor_atual)
        .is("data_saida", null);

      if (updateHistoricoError) {
        console.error("Erro ao atualizar histórico:", updateHistoricoError);
        toast.error("Erro ao atualizar histórico");
      }

      // 5. Inserir novo registro no histórico
      const { error: insertHistoricoError } = await supabase
        .from("processos_historico")
        .insert({
          processo_id: processId,
          setor_id: proximoDepartamento.id.toString(),
          data_entrada: now,
          usuario_id: user.id
        });

      if (insertHistoricoError) {
        console.error("Erro ao inserir novo histórico:", insertHistoricoError);
        toast.error("Erro ao inserir histórico");
      }

      // 6. Atualizar setor atual do processo
      const isLastDepartment = proximoDepartamento.name === "Concluído(a)";
      const newStatus = isLastDepartment ? "Concluído" : "Em andamento";

      const { error: updateProcessoError } = await supabase
        .from("processos")
        .update({
          setor_atual: proximoDepartamento.id.toString(),
          status: newStatus
        })
        .eq("id", processId);

      if (updateProcessoError) {
        console.error("Erro ao atualizar processo:", updateProcessoError);
        toast.error("Erro ao atualizar processo");
        return false;
      }

      // 7. Notificar usuários do novo departamento
      await notifyDepartmentUsers(
        processId,
        proximoDepartamento.id.toString(),
        `O processo ${processo.numero_protocolo} foi movido para o setor ${proximoDepartamento.name}`
      );

      toast.success(`Processo movido para ${proximoDepartamento.name}`, {
        duration: 1500 // Set duration to 1.5 seconds
      });
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      toast.error("Erro ao mover processo", {
        duration: 1500 // Set duration to 1.5 seconds
      });
      return false;
    }
  };

  return { moveToNextDepartment };
};
