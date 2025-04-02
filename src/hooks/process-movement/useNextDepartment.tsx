
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/types";
import { Department } from "@/types";

export const useNextDepartment = (departments: Department[]) => {
  const { toast } = useToast();

  const moveProcessToNextDepartment = async (process: Process) => {
    try {
      if (!process) return false;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept) return false;
      
      // Encontrar o próximo departamento na ordem
      const nextDept = departments.find((d) => d.order === currentDept.order + 1);
      
      if (!nextDept) {
        toast({
          title: "Aviso",
          description: "Não há próximo setor disponível",
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

      // Criar novo histórico para o próximo departamento
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: process.id,
          setor_id: nextDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: "1" // Usuário atual (placeholder)
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Verificar se é o departamento final para marcar como concluído
      const isCompleted = nextDept.order === departments.length;
      const newStatus = isCompleted ? "Concluído" : "Em andamento";

      // Atualizar o processo
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: nextDept.id,
          status: newStatus,
          updated_at: now
        })
        .eq('id', process.id);

      if (updateProcessError) {
        throw updateProcessError;
      }

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
