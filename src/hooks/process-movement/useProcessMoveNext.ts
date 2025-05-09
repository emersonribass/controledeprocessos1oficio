
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { useNotificationService } from "./useNotificationService";
import { saveDateToDatabase } from "@/utils/dateUtils";
import { Process } from "@/types";

export const useProcessMoveNext = (onProcessUpdated: () => void) => {
  const [isMoving, setIsMoving] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { sendNotificationsToSectorUsers } = useNotificationService();

  const moveProcessToNextDepartment = async (
    processId: string, 
    showToast: boolean = false
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
        throw new Error("Setor atual não encontrado");
      }

      // Buscar diretamente o próximo departamento pelo order_num
      const { data: nextDept, error: nextDeptError } = await supabase
        .from('setores')
        .select('*')
        .gt('order_num', currentDept.order_num)
        .order('order_num', { ascending: true })
        .limit(1)
        .single();

      if (nextDeptError) {
        uiToast({
          title: "Aviso",
          description: "Não há próximo setor disponível.",
          variant: "destructive"
        });
        setIsMoving(false);
        return false;
      }

      // >>> ADICIONANDO AQUI A RESTRIÇÃO PARA O SETOR 2 <<<
      if (
        (nextDept.id === 2 || nextDept.id.toString() === "2") &&
        (!process.tipo_processo || process.tipo_processo === "pendente")
      ) {
        uiToast({
          title: "Aviso",
          description: "Você deve preencher o tipo do processo para mover!",
          variant: "destructive"
        });
        setIsMoving(false);
        return false;
      }

      // Atualizar o histórico em uma transação
      const now = saveDateToDatabase(new Date());
      
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
          setor_id: nextDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id,
          created_at: now,
          updated_at: now
        });

      if (newHistoryError) throw newHistoryError;

      // 3. Verificar se é o último departamento
      const isConcludedDept = nextDept.name === "Concluído(a)";
      
      // 4. Atualizar o processo
      const updateData: {
        setor_atual: string;
        updated_at: string;
        status?: string;
      } = {
        setor_atual: nextDept.id.toString(),
        updated_at: now
      };
      
      if (isConcludedDept) {
        updateData.status = "Concluído";
      }

      const { error: updateError } = await supabase
        .from('processos')
        .update(updateData)
        .eq('id', processId);

      if (updateError) throw updateError;

      // 5. Remover responsável do setor destino (se existir)
      // ALTERAÇÃO CHAVE: Não removemos o responsável se o próximo departamento for "Concluído(a)"
      if (!isConcludedDept) {
        const { error: deleteResponsibleError } = await supabase
          .from('setor_responsaveis')
          .delete()
          .eq('processo_id', processId)
          .eq('setor_id', nextDept.id.toString());
  
        if (deleteResponsibleError) {
          console.error("Erro ao remover responsável do setor:", deleteResponsibleError);
          // Continuamos mesmo com erro
        }
      }

      // 6. Enviar notificações apenas para o setor de destino
      await sendNotificationsToSectorUsers(
        processId, 
        nextDept.id.toString(), 
        process.numero_protocolo
      );

      onProcessUpdated();

      // Modificando a chamada de toast para respeitar o parâmetro showToast
      if (showToast) {
        uiToast({
          title: "Sucesso",
          description: `Processo movido para ${nextDept.name}`,
        });
      }
      
      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      
      // Modificando a chamada de toast para respeitar o parâmetro showToast
      if (showToast) {
        uiToast({
          title: "Erro",
          description: "Não foi possível mover o processo para o próximo setor.",
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
    moveProcessToNextDepartment
  };
};
