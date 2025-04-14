
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

      const currentOrder = currentDepartment.order_num;
      const isFromConcludedDept = currentDepartment.name === "Concluído(a)";

      // Buscar o departamento anterior
      const { data: prevDepartment, error: prevDeptError } = await supabase
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
          setor_id: prevDepartment.id.toString(),
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: user.id
        });

      if (newHistoryError) throw newHistoryError;

      // Atualizar o departamento atual do processo e o status se vier do departamento "Concluído(a)"
      const updateData: {
        setor_atual: string;
        updated_at: string;
        status?: string;
        usuario_responsavel: null; // Removendo o responsável ao mudar de setor
      } = {
        setor_atual: prevDepartment.id.toString(),
        updated_at: new Date().toISOString(),
        usuario_responsavel: null // Garantindo que o responsável seja removido
      };

      // Se o processo veio do departamento "Concluído(a)", altera o status para "Em andamento"
      if (isFromConcludedDept || process.status === "Concluído") {
        updateData.status = "Em andamento";
      }

      const { error: updateError } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', processId);

      if (updateError) throw updateError;

      // Remover qualquer responsável de setor existente para o departamento anterior
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', prevDepartment.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
        // Continuamos mesmo se houver erro aqui, não é crítico
      }

      // Enviar notificações para usuários do setor
      await sendNotificationsToSectorUsers(
        processId, 
        prevDepartment.id.toString(), 
        process.numero_protocolo
      );

      // Removido toast de confirmação
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
