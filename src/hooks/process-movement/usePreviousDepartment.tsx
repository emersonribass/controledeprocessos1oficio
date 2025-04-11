
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process, PROCESS_STATUS } from "@/types";
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

      // Buscar o responsável principal do processo
      const { data: processData, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', process.id)
        .single();

      if (processError) {
        throw processError;
      }

      const mainResponsibleUser = processData.usuario_responsavel;

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
          usuario_id: mainResponsibleUser || process.userId || "1", // Usar o responsável principal
          usuario_responsavel_setor: null // Sem responsável de setor ainda
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Atualizar o processo, mantendo o usuário responsável principal
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: prevDept.id,
          status: "Em andamento", // Sempre será "Em andamento" ao voltar
          updated_at: now
          // Mantém o usuário responsável principal inalterado
        })
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
