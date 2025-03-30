
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";

export const useProcessMovement = (processes: Process[]) => {
  const { toast } = useToast();
  const { departments } = useDepartmentsData();

  const moveProcessToNextDepartment = async (processId: string) => {
    try {
      // Obter informações do processo atual
      const process = processes.find(p => p.id === processId);
      if (!process) return;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept) return;
      
      // Encontrar o próximo departamento na ordem
      const nextDept = departments.find((d) => d.order === currentDept.order + 1);
      
      if (!nextDept) {
        toast({
          title: "Aviso",
          description: "Não há próximo setor disponível",
          variant: "destructive"
        });
        return;
      }

      // Atualizar saída no histórico atual
      const now = new Date().toISOString();
      
      // Buscar o histórico atual sem data de saída
      const { data: currentHistoryData, error: currentHistoryError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
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
          processo_id: processId,
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
        .eq('id', processId);

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

  const moveProcessToPreviousDepartment = async (processId: string) => {
    try {
      // Obter informações do processo atual
      const process = processes.find(p => p.id === processId);
      if (!process) return;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept || currentDept.order <= 1) {
        toast({
          title: "Aviso",
          description: "Não há setor anterior disponível",
          variant: "destructive"
        });
        return;
      }
      
      // Encontrar o departamento anterior na ordem
      const prevDept = departments.find((d) => d.order === currentDept.order - 1);
      
      if (!prevDept) return;

      // Atualizar saída no histórico atual
      const now = new Date().toISOString();
      
      // Buscar o histórico atual sem data de saída
      const { data: currentHistoryData, error: currentHistoryError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
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
          processo_id: processId,
          setor_id: prevDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: "1" // Usuário atual (placeholder)
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Atualizar o processo
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: prevDept.id,
          status: "Em andamento", // Sempre será "Em andamento" ao voltar
          updated_at: now
        })
        .eq('id', processId);

      if (updateProcessError) {
        throw updateProcessError;
      }

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

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment
  };
};
