
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

      // Toast inicial para feedback imediato ao usuário
      toast.loading("Movendo processo...", {
        duration: 1000
      });

      // 1. Obter informações do processo e setores em paralelo para otimizar
      const [processoResult, setoresResult] = await Promise.all([
        supabase
          .from("processos")
          .select("setor_atual, numero_protocolo")
          .eq("id", processId)
          .single(),
        supabase
          .from("setores")
          .select("id, name, order_num")
          .order("order_num", { ascending: true })
      ]);

      const processoError = processoResult.error;
      const processo = processoResult.data;
      const setoresError = setoresResult.error;
      const setores = setoresResult.data;

      if (processoError || !processo) {
        console.error("Erro ao obter informações do processo:", processoError);
        toast.error("Erro ao mover processo", {
          duration: 1500
        });
        return false;
      }

      if (setoresError || !setores) {
        console.error("Erro ao obter setores:", setoresError);
        toast.error("Erro ao mover processo", {
          duration: 1500
        });
        return false;
      }

      // 3. Encontrar o departamento atual e o próximo
      const departamentoAtual = setores.find(s => s.id.toString() === processo.setor_atual);
      if (!departamentoAtual) {
        toast.error("Setor atual não encontrado", {
          duration: 1500
        });
        return false;
      }

      const proximos = setores.filter(s => s.order_num > departamentoAtual.order_num)
        .sort((a, b) => a.order_num - b.order_num);

      if (proximos.length === 0) {
        toast.error("Não há próximo setor disponível", {
          duration: 1500
        });
        return false;
      }

      const proximoDepartamento = proximos[0];
      const now = new Date().toISOString();
      
      // 4, 5, 6. Executar operações de banco de dados em paralelo quando possível
      const operacoes = [];

      // 4. Marcar data de saída no histórico atual
      operacoes.push(
        supabase
          .from("processos_historico")
          .update({ data_saida: now })
          .eq("processo_id", processId)
          .eq("setor_id", processo.setor_atual)
          .is("data_saida", null)
      );

      // 5. Inserir novo registro no histórico
      operacoes.push(
        supabase
          .from("processos_historico")
          .insert({
            processo_id: processId,
            setor_id: proximoDepartamento.id.toString(),
            data_entrada: now,
            usuario_id: user.id
          })
      );

      // 6. Atualizar setor atual do processo
      const isLastDepartment = proximoDepartamento.name === "Concluído(a)";
      const newStatus = isLastDepartment ? "Concluído" : "Em andamento";

      operacoes.push(
        supabase
          .from("processos")
          .update({
            setor_atual: proximoDepartamento.id.toString(),
            status: newStatus
          })
          .eq("id", processId)
      );

      // Executar todas as operações em paralelo
      const results = await Promise.all(operacoes);
      
      // Verificar se alguma operação falhou
      const erros = results.filter(r => r.error);
      if (erros.length > 0) {
        console.error("Erros ao atualizar banco de dados:", erros);
        toast.error("Erro ao atualizar processo", {
          duration: 1500
        });
        return false;
      }

      // 7. Notificar usuários do novo departamento em segundo plano para não atrasar a resposta
      notifyDepartmentUsers(
        processId,
        proximoDepartamento.id.toString(),
        `O processo ${processo.numero_protocolo} foi movido para o setor ${proximoDepartamento.name}`
      ).catch(error => {
        console.error("Erro ao enviar notificações:", error);
      });

      toast.success(`Processo movido para ${proximoDepartamento.name}`, {
        duration: 1500
      });
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      toast.error("Erro ao mover processo", {
        duration: 1500
      });
      return false;
    }
  };

  return { moveToNextDepartment };
};
