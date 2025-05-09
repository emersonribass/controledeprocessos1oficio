import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/types";
import { Department } from "@/types";
import { useNotificationsService } from "@/hooks/useNotificationsService";
import { saveDateToDatabase } from "@/utils/dateUtils";

export const useNextDepartment = (departments: Department[]) => {
  const { toast } = useToast();
  const { notifyDepartmentUsers } = useNotificationsService();

  const moveProcessToNextDepartment = async (process: Process) => {
    try {
      if (!process) return false;

      const currentDeptId = process.currentDepartment;
      
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

      const now = saveDateToDatabase(new Date());
      
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

      if (currentHistoryData) {
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ 
            data_saida: now,
            updated_at: now 
          })
          .eq('id', currentHistoryData.id);

        if (updateError) {
          throw updateError;
        }
      }

      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: process.id,
          setor_id: nextDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: process.userId || "1",
          created_at: now,
          updated_at: now
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', process.id)
        .eq('setor_id', nextDept.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao limpar responsável do setor:", deleteResponsibleError);
        // Não bloquear o processo se essa operação falhar
      }

      const isLastDepartment = !departments.some(d => d.order > nextDept.order_num && d.name !== "Concluído(a)");
      const newStatus = isLastDepartment ? "Concluído" : "Em andamento";

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
