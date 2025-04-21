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

  const moveProcessToPreviousDepartment = async (
    processId: string, 
    showToast: boolean = false  // Novo parâmetro com valor padrão true
  ) => {
    if (!user) return false;
    
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

      // Obter os dados do departamento atual
      const { data: currentDept, error: currentDeptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', parseInt(process.setor_atual, 10))
        .single();

      if (currentDeptError || !currentDept) {
        throw new Error("Departamento atual não encontrado");
      }

      // Se já estiver no primeiro departamento, não pode voltar
      if (currentDept.order_num <= 1) {
        if (showToast) {
          uiToast({
            title: "Aviso",
            description: "Este processo já está no primeiro departamento.",
            variant: "destructive"
          });
        }
        setIsMoving(false);
        return false;
      }

      // Buscar diretamente o departamento anterior pelo order_num
      const { data: prevDept, error: prevDeptError } = await supabase
        .from('setores')
        .select('*')
        .lt('order_num', currentDept.order_num)
        .order('order_num', { ascending: false })
        .limit(1)
        .single();

      if (prevDeptError) {
        if (showToast) {
          uiToast({
            title: "Aviso",
            description: "Não foi possível encontrar o departamento anterior.",
            variant: "destructive"
          });
        }
        setIsMoving(false);
        return false;
      }

      // Atualizar o histórico em uma transação
      const now = new Date().toISOString();
      
      // 1. Fechar o histórico atual
      const { data: currentHistory, error: historyQueryError } = await supabase
        .from('processos_historico')
        .select('id')
        .eq('processo_id', processId)
        .eq('setor_id', process.setor_atual)
        .is('data_saida', null)
        .single();
      
      if (historyQueryError && historyQueryError.code !== 'PGRST116') {
        throw historyQueryError;
      }
      
      if (currentHistory) {
        const { error: historyError } = await supabase
          .from('processos_historico')
          .update({
            data_saida: now,
            usuario_id: user.id
          })
          .eq('id', currentHistory.id);

        if (historyError) throw historyError;
      }

      // 2. Criar novo histórico
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: prevDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id
        });

      if (newHistoryError) throw newHistoryError;

      // 3. Verificar se está voltando de um processo concluído
      let newStatus = process.status;
      if (process.status === "Concluído" || currentDept.name === "Concluído(a)") {
        newStatus = "Em andamento";
      }

      // 4. Atualizar o processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          setor_atual: prevDept.id.toString(),
          updated_at: now,
          status: newStatus
        })
        .eq('id', processId);

      if (updateError) throw updateError;

      // 5. Remover responsável do setor destino (se existir)
      const { error: deleteResponsibleError } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', prevDept.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
        // Continuamos mesmo com erro
      }

      // 6. Enviar notificações apenas para o setor de destino
      await sendNotificationsToSectorUsers(
        processId, 
        prevDept.id.toString(), 
        process.numero_protocolo
      );

      onProcessUpdated();
      // Modificando a chamada de toast para respeitar o parâmetro showToast
      if (showToast) {
        uiToast({
          title: "Sucesso",
          description: `Processo movido para ${prevDept.name}`,
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      
      // Modificando a chamada de toast para respeitar o parâmetro showToast
      if (showToast) {
        uiToast({
          title: "Erro",
          description: "Não foi possível mover o processo para o departamento anterior.",
          variant: "destructive"
        });
      }
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
