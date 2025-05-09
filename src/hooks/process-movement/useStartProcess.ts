
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";
import { saveDateToDatabase } from "@/utils/dateUtils";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("useStartProcess");

export const useStartProcess = (onProcessUpdated: () => void) => {
  const [isStarting, setIsStarting] = useState(false);
  const { toast: uiToast } = useToast();
  const { user } = useAuth();

  const startProcess = async (processId: string): Promise<boolean> => {
    if (!user) return false;
    
    setIsStarting(true);
    try {
      logger.debug(`Iniciando processo ${processId} pelo usuário ${user.id}`);
      
      // Buscar dados do processo
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();

      if (processError) {
        logger.error("Erro ao buscar processo:", processError);
        throw processError;
      }
      
      if (!process) {
        logger.error(`Processo ${processId} não encontrado`);
        throw new Error("Processo não encontrado");
      }

      // Validação: tipo do processo precisa estar definido
      if (!process.tipo_processo) {
        logger.error(`Processo ${processId} sem tipo definido`);
        uiToast({
          title: "Erro",
          description: "Selecione um tipo de processo antes de iniciá-lo.",
          variant: "destructive"
        });
        setIsStarting(false);
        return false;
      }

      // Obter o primeiro departamento
      const { data: firstDepartment, error: firstDeptError } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true })
        .limit(1)
        .single();

      if (firstDeptError) {
        logger.error("Erro ao buscar primeiro departamento:", firstDeptError);
        throw firstDeptError;
      }

      // Definir data_fim_esperada de acordo com o time_limit do primeiro setor
      let expectedEndDate: string | null = null;
      if (firstDepartment && firstDepartment.time_limit) {
        const now = new Date();
        const prazo = new Date(now);
        prazo.setDate(prazo.getDate() + Number(firstDepartment.time_limit));
        expectedEndDate = saveDateToDatabase(prazo);
      }

      const now = saveDateToDatabase(new Date());

      logger.debug(`Atualizando processo ${processId} para setor ${firstDepartment.id}, status: Em andamento`);
      
      // Atualizar o processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          setor_atual: firstDepartment.id.toString(),
          updated_at: now,
          status: "Em andamento",
          data_inicio: now,
          usuario_responsavel: user.id,
          data_fim_esperada: expectedEndDate
        })
        .eq('id', processId);

      if (updateError) {
        logger.error("Erro ao atualizar processo:", updateError);
        throw updateError;
      }

      // Criar entrada no histórico
      logger.debug(`Criando histórico para processo ${processId} no setor ${firstDepartment.id}`);
      
      const { error: historyError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: firstDepartment.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id,
          created_at: now,
          updated_at: now
        });

      if (historyError) {
        logger.error("Erro ao criar histórico:", historyError);
        throw historyError;
      }

      // Atribuir o usuário como responsável no primeiro setor
      logger.debug(`Atribuindo usuário ${user.id} como responsável pelo processo ${processId} no setor ${firstDepartment.id}`);
      
      const { error: responsibleError } = await supabase
        .from('setor_responsaveis')
        .insert({
          processo_id: processId,
          setor_id: firstDepartment.id.toString(),
          usuario_id: user.id,
          data_atribuicao: now,
          created_at: now,
          updated_at: now
        });

      if (responsibleError) {
        logger.error("Erro ao atribuir responsável de setor:", responsibleError);
      }

      logger.debug(`Processo ${processId} iniciado com sucesso`);
      
      onProcessUpdated();
      uiToast({
        title: "Sucesso",
        description: "Processo iniciado com sucesso"
      });
      return true;
    } catch (error) {
      logger.error("Erro ao iniciar processo:", error);
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
