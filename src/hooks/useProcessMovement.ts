
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";

export const useProcessMovement = (onProcessUpdated: () => void) => {
  const [isMoving, setIsMoving] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  /**
   * Move o processo para o próximo departamento
   */
  const moveProcessToNextDepartment = async (processId: string) => {
    if (!user) return;
    
    setIsMoving(true);
    try {
      // Primeiro, obter os dados do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*, setores(*)')
        .eq('id', processId)
        .single();

      if (processError) throw processError;

      // Obter a ordem do departamento atual
      const currentDepartment = process.setores;
      if (!currentDepartment) throw new Error("Departamento atual não encontrado");

      const currentOrder = currentDepartment.order_num;

      // Buscar o próximo departamento
      const { data: nextDepartment, error: nextDeptError } = await supabase
        .from('setores')
        .select('*')
        .gt('order_num', currentOrder)
        .order('order_num', { ascending: true })
        .limit(1)
        .single();

      if (nextDeptError) throw nextDeptError;

      // Atualizar o histórico
      const { error: historyError } = await supabase
        .from('processos_historico')
        .update({
          exit_date: new Date().toISOString(),
          processed_by: user.id
        } as any)
        .eq('processo_id', processId)
        .eq('department_id', currentDepartment.id)
        .is('exit_date', null);

      if (historyError) throw historyError;

      // Inserir nova entrada no histórico
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          department_id: nextDepartment.id,
          entry_date: new Date().toISOString(),
          exit_date: null
        });

      if (newHistoryError) throw newHistoryError;

      // Atualizar o departamento atual do processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          current_department: nextDepartment.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', processId);

      if (updateError) throw updateError;

      // Enviar notificações para usuários do setor
      await sendNotificationsToSectorUsers(processId, nextDepartment.id, process.protocol_number);

      toast.success(`Processo movido para ${nextDepartment.name}`);
      onProcessUpdated();
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível mover o processo para o próximo departamento.",
        variant: "destructive"
      });
    } finally {
      setIsMoving(false);
    }
  };

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
        .select('*, setores(*)')
        .eq('id', processId)
        .single();

      if (processError) throw processError;

      // Obter a ordem do departamento atual
      const currentDepartment = process.setores;
      if (!currentDepartment) throw new Error("Departamento atual não encontrado");

      const currentOrder = currentDepartment.order_num;

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
          exit_date: new Date().toISOString(),
          processed_by: user.id
        } as any)
        .eq('processo_id', processId)
        .eq('department_id', currentDepartment.id)
        .is('exit_date', null);

      if (historyError) throw historyError;

      // Inserir nova entrada no histórico
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          department_id: prevDepartment.id,
          entry_date: new Date().toISOString(),
          exit_date: null
        });

      if (newHistoryError) throw newHistoryError;

      // Atualizar o departamento atual do processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          current_department: prevDepartment.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', processId);

      if (updateError) throw updateError;

      // Enviar notificações para usuários do setor
      await sendNotificationsToSectorUsers(processId, prevDepartment.id, process.protocol_number);

      toast.success(`Processo movido para ${prevDepartment.name}`);
      onProcessUpdated();
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível mover o processo para o departamento anterior.",
        variant: "destructive"
      });
    } finally {
      setIsMoving(false);
    }
  };

  /**
   * Inicia um processo que está com status não iniciado
   */
  const startProcess = async (processId: string) => {
    if (!user) return;
    
    setIsStarting(true);
    try {
      // Primeiro, obter os dados do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) throw processError;

      // Obter o departamento inicial (geralmente o de menor ordem)
      const { data: firstDepartment, error: deptError } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true })
        .limit(1)
        .single();

      if (deptError) throw deptError;

      // Inserir entrada inicial no histórico
      const { error: historyError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          department_id: firstDepartment.id,
          entry_date: new Date().toISOString(),
          exit_date: null
        });

      if (historyError) throw historyError;

      // Atualizar o status do processo para Em andamento e atribuir responsável
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          status: 'Em andamento',
          current_department: firstDepartment.id,
          usuario_responsavel: user.id,
          updated_at: new Date().toISOString()
        } as any)
        .eq('id', processId);

      if (updateError) throw updateError;

      // Enviar notificações para usuários do setor
      await sendNotificationsToSectorUsers(processId, firstDepartment.id, process.protocol_number);

      toast.success(`Processo iniciado em ${firstDepartment.name}`);
      onProcessUpdated();
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível iniciar o processo.",
        variant: "destructive"
      });
    } finally {
      setIsStarting(false);
    }
  };

  /**
   * Envia notificações para todos os usuários do setor
   */
  const sendNotificationsToSectorUsers = async (processId: string, sectorId: string, protocolNumber: string) => {
    try {
      // Buscar todos os usuários que têm acesso ao setor
      const { data: users, error: usersError } = await supabase
        .from('usuarios')
        .select('*')
        .contains('setores_atribuidos', [sectorId]);

      if (usersError) throw usersError;

      if (!users || users.length === 0) {
        console.log("Nenhum usuário encontrado para o setor:", sectorId);
        return;
      }

      // Enviar notificação para cada usuário
      const notifications = users.map(user => ({
        usuario_id: user.id,
        processo_id: processId,
        message: `O processo ${protocolNumber} foi movido para seu setor. Clique para aceitar a responsabilidade.`,
        tipo: 'processo_movido',
        data_criacao: new Date().toISOString(),
        lida: false,
        respondida: false
      }));

      const { error: notifyError } = await supabase
        .from('notificacoes')
        .insert(notifications);

      if (notifyError) throw notifyError;

      console.log(`Notificações enviadas para ${users.length} usuários do setor ${sectorId}`);
    } catch (error) {
      console.error("Erro ao enviar notificações:", error);
    }
  };

  return {
    isMoving,
    isStarting,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess
  };
};
