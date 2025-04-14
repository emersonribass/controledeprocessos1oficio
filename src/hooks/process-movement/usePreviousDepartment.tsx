
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/types";
import { Department } from "@/types";
import { useNotificationsService } from "@/hooks/useNotificationsService";

export const usePreviousDepartment = (departments: Department[]) => {
  const { toast } = useToast();
  const { notifyDepartmentUsers } = useNotificationsService();

  const moveProcessToPreviousDepartment = async (process: Process) => {
    try {
      if (!process) return false;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept || currentDept.order <= 1) {
        toast({
          title: "Aviso",
          description: "Não há setor anterior disponível",
          variant: "destructive"
        });
        return false;
      }
      
      // Encontrar o departamento anterior na ordem
      const prevDept = departments.find((d) => d.order === currentDept.order - 1);
      
      if (!prevDept) return false;

      // Atualizar saída no histórico atual
      const now = new Date().toISOString();
      
      // Buscar o histórico atual sem data de saída
      const { data: currentHistoryData, error: currentHistoryError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', process.id)
        .eq('setor_id', currentDeptId)
        .is('data_saida', null)
        .maybeSingle();

      if (currentHistoryError) {
        throw currentHistoryError;
      }

      // Atualizar a data de saída
      if (currentHistoryData) {
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ data_saida: now })
          .eq('id', currentHistoryData.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Criar novo histórico para o departamento anterior
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: process.id,
          setor_id: prevDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: process.userId || "1" // Usuário atual (placeholder)
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Verificar se o processo está vindo do departamento "Concluído(a)"
      const isFromConcludedDept = currentDept.name === "Concluído(a)";
      const isProcessCompleted = process.status === "completed";

      // IMPORTANTE: Sempre deletar o responsável do setor destino se existir
      // Isso garante que o usuário precise aceitar novamente a responsabilidade
      // Mesmo que ele já tenha sido responsável anteriormente
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', process.id)
        .eq('setor_id', prevDept.id);

      if (deleteResponsibleError) {
        console.error("Erro ao limpar responsável do setor:", deleteResponsibleError);
        // Não bloquear o processo se essa operação falhar
      }

      // Atualizar o processo, mantendo o usuário responsável
      const updateData: {
        setor_atual: string;
        status?: string;
        updated_at: string;
      } = { 
        setor_atual: prevDept.id,
        updated_at: now
        // Não alteramos mais usuario_responsavel
      };

      // Se o processo vier do departamento "Concluído(a)" ou se seu status for "completed", alterar para "Em andamento"
      if (isFromConcludedDept || isProcessCompleted) {
        updateData.status = "Em andamento";
      }

      const { error: updateProcessError } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', process.id);

      if (updateProcessError) {
        throw updateProcessError;
      }
      
      // Enviar notificações para usuários do departamento anterior
      await notifyDepartmentUsers(
        process.id, 
        prevDept.id, 
        `Processo ${process.protocolNumber} foi devolvido para o setor ${prevDept.name} e necessita de atenção.`
      );

      toast({
        title: "Sucesso",
        description: `Processo devolvido para ${prevDept.name}`
      });

      return true;
    } catch (error) {
      console.error('Erro ao mover processo para setor anterior:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o processo.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { moveProcessToPreviousDepartment };
};
