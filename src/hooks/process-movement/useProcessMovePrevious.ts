
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
    if (!user) return false;
    
    setIsMoving(true);
    try {
      console.log(`Iniciando movimentação do processo ${processId} para o setor anterior`);
      
      // Primeiro, obter os dados do processo
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

      // Verificar se é o primeiro departamento (ordem = 1)
      if (currentDepartment.order_num <= 1) {
        console.error("Já está no primeiro departamento, não é possível voltar");
        throw new Error("Não é possível voltar do primeiro departamento");
      }

      const currentOrder = currentDepartment.order_num;

      // Buscar o departamento anterior baseado na ordem (não no ID)
      const { data: prevDepartments, error: prevDeptError } = await supabase
        .from('setores')
        .select('*')
        .lt('order_num', currentOrder)
        .order('order_num', { ascending: false })
        .limit(1);

      if (prevDeptError) {
        console.error("Erro ao buscar departamento anterior:", prevDeptError);
        throw prevDeptError;
      }
      
      if (!prevDepartments || prevDepartments.length === 0) {
        console.error("Departamento anterior não encontrado");
        throw new Error("Não foi possível encontrar o departamento anterior");
      }
      
      const prevDepartment = prevDepartments[0];
      console.log(`Departamento anterior encontrado: ${prevDepartment.name}, ID: ${prevDepartment.id}, ordem: ${prevDepartment.order_num}`);

      // Atualizar o histórico atual
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
      const prevDepartmentIdString = prevDepartment.id.toString();
      
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: prevDepartmentIdString,
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: user.id
        });

      if (newHistoryError) {
        console.error("Erro ao inserir novo histórico:", newHistoryError);
        throw newHistoryError;
      }
      
      console.log(`Nova entrada de histórico criada para o setor ${prevDepartmentIdString}`);

      // Se estamos voltando de "Concluído(a)", ou o status já é "Concluído", 
      // devemos alterar o status para "Em andamento"
      let newStatus = process.status;
      if (process.status === "Concluído" || currentDepartment.name === "Concluído(a)") {
        newStatus = "Em andamento";
        console.log("Status será alterado para Em andamento");
      }

      // Atualizar o departamento atual do processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          setor_atual: prevDepartmentIdString,
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);

      if (updateError) {
        console.error("Erro ao atualizar processo:", updateError);
        throw updateError;
      }
      
      console.log(`Processo atualizado com novo setor: ${prevDepartmentIdString} e status: ${newStatus}`);

      // IMPORTANTE: Sempre remover qualquer responsável de setor existente para o setor anterior
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', prevDepartmentIdString);

      if (deleteResponsibleError) {
        console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
        // Continuamos mesmo se houver erro aqui, não é crítico
      } else {
        console.log(`Responsáveis removidos para o processo no setor ${prevDepartmentIdString}`);
      }

      // Enviar notificações para usuários do setor
      try {
        const notificacoesEnviadas = await sendNotificationsToSectorUsers(
          processId, 
          prevDepartmentIdString, 
          process.numero_protocolo
        );
        console.log(`Notificações enviadas para ${notificacoesEnviadas} usuários do setor ${prevDepartmentIdString}`);
      } catch (notifError) {
        console.error("Erro ao enviar notificações (não crítico):", notifError);
        // Continuamos mesmo com erro nas notificações
      }

      onProcessUpdated();
      console.log("Processo movido com sucesso para o setor anterior");
      return true;
    } catch (error) {
      console.error("Erro ao mover processo para o setor anterior:", error);
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
