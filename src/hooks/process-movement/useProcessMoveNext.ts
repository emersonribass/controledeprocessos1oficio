
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { useNotificationService } from "./useNotificationService";

export const useProcessMoveNext = (onProcessUpdated: () => void) => {
  const [isMoving, setIsMoving] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { sendNotificationsToSectorUsers } = useNotificationService();

  /**
   * Move o processo para o próximo departamento
   */
  const moveProcessToNextDepartment = async (processId: string) => {
    if (!user) return false;
    
    setIsMoving(true);
    try {
      console.log(`Iniciando movimentação do processo ${processId} para o próximo setor`);
      
      // Primeiro, obter os dados do processo específico
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        throw processError;
      }

      if (!process) {
        console.error("Processo não encontrado");
        throw new Error("Processo não encontrado");
      }
      
      console.log(`Processo encontrado: ${process.numero_protocolo}, setor atual: ${process.setor_atual}`);

      // Obter a ordem do departamento atual
      const currentSectorId = process.setor_atual;
      
      const { data: currentDepartment, error: currentDeptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', parseInt(currentSectorId, 10))
        .single();

      if (currentDeptError) {
        console.error("Erro ao buscar departamento atual:", currentDeptError);
        throw currentDeptError;
      }

      if (!currentDepartment) {
        console.error(`Departamento atual (ID: ${currentSectorId}) não encontrado`);
        throw new Error("Departamento atual não encontrado");
      }
      
      console.log(`Departamento atual encontrado: ${currentDepartment.name}, ordem: ${currentDepartment.order_num}`);

      const currentOrder = currentDepartment.order_num;

      // Buscar o próximo departamento baseado na ordem (não no ID)
      const { data: nextDepartments, error: nextDeptError } = await supabase
        .from('setores')
        .select('*')
        .gt('order_num', currentOrder)
        .order('order_num', { ascending: true })
        .limit(1);

      if (nextDeptError) {
        console.error("Erro ao buscar próximo departamento:", nextDeptError);
        throw nextDeptError;
      }
      
      if (!nextDepartments || nextDepartments.length === 0) {
        console.error("Próximo departamento não encontrado");
        throw new Error("Não foi possível encontrar o próximo departamento");
      }
      
      const nextDepartment = nextDepartments[0];
      console.log(`Próximo departamento encontrado: ${nextDepartment.name}, ID: ${nextDepartment.id}, ordem: ${nextDepartment.order_num}`);

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

      if (historyError) {
        console.error("Erro ao atualizar histórico:", historyError);
        throw historyError;
      }
      
      console.log(`Histórico atualizado com data de saída para o setor ${process.setor_atual}`);

      // Inserir nova entrada no histórico
      // Nota: Converta o ID do setor para string para manter consistência
      const nextDepartmentIdString = nextDepartment.id.toString();
      
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: nextDepartmentIdString,
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: user.id
        });

      if (newHistoryError) {
        console.error("Erro ao inserir novo histórico:", newHistoryError);
        throw newHistoryError;
      }
      
      console.log(`Nova entrada de histórico criada para o setor ${nextDepartmentIdString}`);

      // Verificar se o próximo departamento é o "Concluído(a)"
      const isConcludedDept = nextDepartment.name === "Concluído(a)";
      
      // Atualizar o departamento atual do processo e o status se for o departamento "Concluído(a)"
      const updateData: {
        setor_atual: string;
        updated_at: string;
        status?: string;
      } = {
        setor_atual: nextDepartmentIdString,
        updated_at: new Date().toISOString()
      };
      
      // Se for o departamento "Concluído(a)", atualiza o status
      if (isConcludedDept) {
        updateData.status = "Concluído";
        console.log("Processo será marcado como Concluído");
      }

      const { error: updateError } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', processId);

      if (updateError) {
        console.error("Erro ao atualizar processo:", updateError);
        throw updateError;
      }
      
      console.log(`Processo atualizado com novo setor: ${nextDepartmentIdString}`);

      // IMPORTANTE: Sempre remover qualquer responsável de setor existente para o próximo setor
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', nextDepartmentIdString);

      if (deleteResponsibleError) {
        console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
        // Continuamos mesmo se houver erro aqui, não é crítico
      } else {
        console.log(`Responsáveis removidos para o processo no setor ${nextDepartmentIdString}`);
      }

      // Enviar notificações para usuários do setor
      try {
        const notificacoesEnviadas = await sendNotificationsToSectorUsers(
          processId, 
          nextDepartmentIdString, 
          process.numero_protocolo
        );
        console.log(`Notificações enviadas para ${notificacoesEnviadas} usuários do setor ${nextDepartmentIdString}`);
      } catch (notifError) {
        console.error("Erro ao enviar notificações (não crítico):", notifError);
        // Continuamos mesmo com erro nas notificações
      }

      // Chamar callback para atualizar a UI, mas sem recarregar todos os processos
      onProcessUpdated();
      console.log("Processo movido com sucesso para o próximo setor");
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível mover o processo para o próximo departamento.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsMoving(false);
    }
  };

  return {
    isMoving,
    moveProcessToNextDepartment
  };
};
