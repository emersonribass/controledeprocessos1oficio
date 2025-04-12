
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { useNotificationService } from "./useNotificationService";

export const useStartProcess = (onProcessUpdated: () => void) => {
  const [isStarting, setIsStarting] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();
  const { sendNotificationsToSectorUsers } = useNotificationService();

  /**
   * Inicia um processo que está com status não iniciado
   */
  const startProcess = async (processId: string) => {
    if (!user) return false;
    
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
          setor_id: firstDepartment.id.toString(),
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: user.id
        });

      if (historyError) throw historyError;

      // Atualizar o status do processo para Em andamento e atribuir responsável
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          status: 'Em andamento',
          setor_atual: firstDepartment.id.toString(),
          usuario_responsavel: user.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', processId);

      if (updateError) throw updateError;

      // Enviar notificações para usuários do setor
      await sendNotificationsToSectorUsers(
        processId, 
        firstDepartment.id.toString(), 
        process.numero_protocolo
      );

      toast.success(`Processo iniciado em ${firstDepartment.name}`);
      onProcessUpdated();
      return true;
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      uiToast({
        title: "Erro",
        description: "Não foi possível iniciar o processo.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsStarting(false);
    }
  };

  return {
    isStarting,
    startProcess
  };
};
