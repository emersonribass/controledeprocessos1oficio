import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/types";
import { Department } from "@/types";
import { useNotificationsService } from "@/hooks/useNotificationsService";
import { convertToUTC } from "@/utils/dateUtils";

export const useNextDepartment = (departments: Department[]) => {
  const { toast } = useToast();
  const { notifyDepartmentUsers } = useNotificationsService();

  const moveProcessToNextDepartment = async (process: Process) => {
    try {
      if (!process) return false;

      const currentDeptId = process.currentDepartment;
      
      // Buscar em uma única consulta o departamento atual pelo ID
      const { data: currentDept, error: currentDeptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', parseInt(currentDeptId, 10))
        .single();
      
      if (currentDeptError || !currentDept) {
        console.error("Erro ao buscar setor atual:", currentDeptError);
        toast({
          title: "Erro",
          description: "Não foi possível encontrar o setor atual.",
          variant: "destructive"
        });
        return false;
      }
      
      // Encontrar o próximo departamento com base no order_num (diretamente no banco)
      const { data: nextDept, error: nextDeptError } = await supabase
        .from('setores')
        .select('*')
        .gt('order_num', currentDept.order_num)
        .order('order_num', { ascending: true })
        .limit(1)
        .single();
      
      if (nextDeptError) {
        console.error("Erro ao buscar próximo setor:", nextDeptError);
        toast({
          title: "Aviso",
          description: "Não há próximo setor disponível",
          variant: "destructive"
        });
        return false;
      }

      // Atualizar saída no histórico atual
      const now = convertToUTC(new Date()).toISOString();
      
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

      // Criar novo histórico para o próximo departamento
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: process.id,
          setor_id: nextDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: process.userId || "1"
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // IMPORTANTE: Sempre deletar o responsável do setor destino se existir
      // Isso garante que o usuário precise aceitar novamente a responsabilidade
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', process.id)
        .eq('setor_id', nextDept.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao limpar responsável do setor:", deleteResponsibleError);
        // Não bloquear o processo se essa operação falhar
      }

      // Verificar se é o departamento final para marcar como concluído
      const isLastDepartment = !departments.some(d => d.order > nextDept.order_num && d.name !== "Concluído(a)");
      const newStatus = isLastDepartment ? "Concluído" : "Em andamento";

      // Atualizar o processo, mantendo o usuário responsável
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: nextDept.id.toString(),
          status: newStatus,
          updated_at: now
        })
        .eq('id', process.id);

      if (updateProcessError) {
        throw updateProcessError;
      }
      
      // Enviar notificações para usuários do próximo departamento - apenas uma vez
      await notifyDepartmentUsers(
        process.id, 
        nextDept.id.toString(), 
        `Processo ${process.protocolNumber} foi movido para o setor ${nextDept.name} e necessita de atenção.`
      );

      toast({
        title: "Sucesso",
        description: `Processo movido para ${nextDept.name}`
      });

      return true;
    } catch (error) {
      console.error('Erro ao mover processo para próximo setor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o processo.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { moveProcessToNextDepartment };
};
