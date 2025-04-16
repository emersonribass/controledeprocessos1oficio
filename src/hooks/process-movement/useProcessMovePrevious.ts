
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { useNotificationService } from "./useNotificationService";

export const useProcessMovePrevious = (onProcessUpdated: () => void) => {
  const [isMoving, setIsMoving] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { sendNotificationsToSectorUsers } = useNotificationService();

  /**
   * Move o processo para o departamento anterior
   */
  const moveProcessToPreviousDepartment = async (processId: string) => {
    if (!user) return;
    
    setIsMoving(true);
    try {
      // Primeiro, obter os dados do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) throw processError;

      if (!process) throw new Error("Processo não encontrado");

      // Obter a ordem do departamento atual
      const { data: currentDepartment, error: currentDeptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', parseInt(process.setor_atual, 10))
        .single();

      if (currentDeptError) throw currentDeptError;

      if (!currentDepartment) throw new Error("Departamento atual não encontrado");

      // Se já estiver no primeiro departamento, não pode voltar
      if (currentDepartment.order_num <= 1) {
        uiToast({
          title: "Aviso",
          description: "Este processo já está no primeiro departamento.",
          variant: "destructive"
        });
        setIsMoving(false);
        return false;
      }

      const currentOrder = currentDepartment.order_num;

      // Buscar o departamento anterior
      const { data: previousDepartment, error: prevDeptError } = await supabase
        .from('setores')
        .select('*')
        .lt('order_num', currentOrder)
        .order('order_num', { ascending: false })
        .limit(1)
        .single();

      if (prevDeptError) throw prevDeptError;

      // Atualizar o histórico
      const { error: historyError } = await supabase
        .from('processos_historico')
        .update({
          data_saida: new Date().toISOString(),
          usuario_id: user.id
        })
        .eq('processo_id', processId)
        .eq('setor_id', process.setor_atual)
        .is('data_saida', null);

      if (historyError) throw historyError;

      // Inserir nova entrada no histórico
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: previousDepartment.id.toString(),
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: user.id
        });

      if (newHistoryError) throw newHistoryError;

      // Se o processo estiver "Concluído" e estiver voltando do último departamento, mudar para "Em andamento"
      let newStatus = process.status;
      if (process.status === "Concluído" || currentDepartment.name === "Concluído(a)") {
        newStatus = "Em andamento";
      }

      // Atualizar o departamento atual do processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          setor_atual: previousDepartment.id.toString(),
          updated_at: new Date().toISOString(),
          status: newStatus
        })
        .eq('id', processId);

      if (updateError) throw updateError;

      // IMPORTANTE: Sempre remover qualquer responsável de setor existente para o departamento anterior
      // Isso garante que o usuário precise aceitar novamente a responsabilidade
      // Mesmo que ele já tenha sido responsável anteriormente
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', previousDepartment.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
        // Continuamos mesmo se houver erro aqui, não é crítico
      }

      // Enviar notificações para usuários do setor anterior
      await sendNotificationsToSectorUsers(
        processId, 
        previousDepartment.id.toString(), 
        process.numero_protocolo
      );

      onProcessUpdated();
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível mover o processo para o departamento anterior.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsMoving(false);
    }
  };

  return {
    isMoving,
    moveProcessToPreviousDepartment
  };
};
