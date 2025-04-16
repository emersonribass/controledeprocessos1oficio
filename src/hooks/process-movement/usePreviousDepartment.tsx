
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
      
      // Se já estiver no primeiro departamento, não pode voltar
      if (currentDept.order_num <= 1) {
        toast({
          title: "Aviso",
          description: "Este processo já está no primeiro departamento.",
          variant: "destructive"
        });
        return false;
      }

      // Encontrar o departamento anterior com base no order_num (diretamente no banco)
      const { data: prevDept, error: prevDeptError } = await supabase
        .from('setores')
        .select('*')
        .lt('order_num', currentDept.order_num)
        .order('order_num', { ascending: false })
        .limit(1)
        .single();
      
      if (prevDeptError) {
        console.error("Erro ao buscar setor anterior:", prevDeptError);
        toast({
          title: "Aviso",
          description: "Não há setor anterior disponível",
          variant: "destructive"
        });
        return false;
      }

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
          setor_id: prevDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: process.userId || "1" // Usuário atual
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // IMPORTANTE: Sempre deletar o responsável do setor destino se existir
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', process.id)
        .eq('setor_id', prevDept.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao limpar responsável do setor:", deleteResponsibleError);
        // Não bloquear o processo se essa operação falhar
      }

      // Se o processo estiver "Concluído" e estiver voltando, mudar para "Em andamento"
      const newStatus = process.status === "completed" || 
                         currentDept.name === "Concluído(a)" ? 
                         "Em andamento" : process.status;

      // Atualizar o processo
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({
          setor_atual: prevDept.id.toString(),
          status: newStatus,
          updated_at: now
        })
        .eq('id', process.id);

      if (updateProcessError) {
        throw updateProcessError;
      }
      
      // Enviar notificações para usuários do departamento anterior - apenas uma vez
      await notifyDepartmentUsers(
        process.id, 
        prevDept.id.toString(), 
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
