
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types";

/**
 * Serviço para gerenciar movimentação de processos
 */
export const ProcessMovementService = {
  
  /**
   * Move um processo para o próximo setor
   * @param processId ID do processo
   * @param currentSectorId ID do setor atual
   * @param userId ID do usuário que está movendo o processo
   * @returns true se sucesso, false se erro
   */
  async moveToNextDepartment(processId: string, currentSectorId: string, userId: string): Promise<boolean> {
    try {
      // 1. Buscar ordem do setor atual
      const { data: currentSector, error: sectorError } = await supabase
        .from("setores")
        .select("order_num")
        .eq("id", parseInt(currentSectorId))
        .single();

      if (sectorError || !currentSector) {
        console.error("Erro ao buscar setor atual:", sectorError);
        return false;
      }

      // 2. Buscar próximo setor na ordem
      const { data: nextSector, error: nextSectorError } = await supabase
        .from("setores")
        .select("id, order_num, name")
        .gt("order_num", currentSector.order_num)
        .order("order_num", { ascending: true })
        .limit(1)
        .single();

      if (nextSectorError || !nextSector) {
        console.error("Erro ao buscar próximo setor:", nextSectorError);
        return false;
      }

      // 3. Finalizar o registro no histórico do setor atual
      const { error: updateHistoryError } = await supabase
        .from("processos_historico")
        .update({
          data_saida: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("processo_id", processId)
        .eq("setor_id", currentSectorId)
        .is("data_saida", null);

      if (updateHistoryError) {
        console.error("Erro ao atualizar histórico:", updateHistoryError);
        return false;
      }

      // 4. Criar novo registro no histórico para o próximo setor
      const { error: newHistoryError } = await supabase
        .from("processos_historico")
        .insert({
          processo_id: processId,
          setor_id: nextSector.id.toString(),
          usuario_id: userId,
          data_entrada: new Date().toISOString()
        });

      if (newHistoryError) {
        console.error("Erro ao criar novo histórico:", newHistoryError);
        return false;
      }

      // 5. Atualizar o setor atual do processo
      const { error: updateProcessError } = await supabase
        .from("processos")
        .update({
          setor_atual: nextSector.id.toString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", processId);

      if (updateProcessError) {
        console.error("Erro ao atualizar processo:", updateProcessError);
        return false;
      }

      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      return false;
    }
  },

  /**
   * Move um processo para o setor anterior
   * @param processId ID do processo
   * @param currentSectorId ID do setor atual
   * @param userId ID do usuário que está movendo o processo
   * @returns true se sucesso, false se erro
   */
  async moveToPreviousDepartment(processId: string, currentSectorId: string, userId: string): Promise<boolean> {
    try {
      // 1. Buscar ordem do setor atual
      const { data: currentSector, error: sectorError } = await supabase
        .from("setores")
        .select("order_num")
        .eq("id", parseInt(currentSectorId))
        .single();

      if (sectorError || !currentSector) {
        console.error("Erro ao buscar setor atual:", sectorError);
        return false;
      }

      // 2. Buscar setor anterior na ordem
      const { data: previousSector, error: prevSectorError } = await supabase
        .from("setores")
        .select("id, order_num, name")
        .lt("order_num", currentSector.order_num)
        .order("order_num", { ascending: false })
        .limit(1)
        .single();

      if (prevSectorError || !previousSector) {
        console.error("Erro ao buscar setor anterior:", prevSectorError);
        return false;
      }

      // 3. Finalizar o registro no histórico do setor atual
      const { error: updateHistoryError } = await supabase
        .from("processos_historico")
        .update({
          data_saida: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq("processo_id", processId)
        .eq("setor_id", currentSectorId)
        .is("data_saida", null);

      if (updateHistoryError) {
        console.error("Erro ao atualizar histórico:", updateHistoryError);
        return false;
      }

      // 4. Criar novo registro no histórico para o setor anterior
      const { error: newHistoryError } = await supabase
        .from("processos_historico")
        .insert({
          processo_id: processId,
          setor_id: previousSector.id.toString(),
          usuario_id: userId,
          data_entrada: new Date().toISOString()
        });

      if (newHistoryError) {
        console.error("Erro ao criar novo histórico:", newHistoryError);
        return false;
      }

      // 5. Atualizar o setor atual do processo
      const { error: updateProcessError } = await supabase
        .from("processos")
        .update({
          setor_atual: previousSector.id.toString(),
          updated_at: new Date().toISOString()
        })
        .eq("id", processId);

      if (updateProcessError) {
        console.error("Erro ao atualizar processo:", updateProcessError);
        return false;
      }

      // 6. Limpar possíveis responsáveis do setor anterior
      // para permitir que novos usuários aceitem a responsabilidade
      const { error: deleteResponsibleError } = await supabase
        .from("setor_responsaveis")
        .delete()
        .eq("processo_id", processId)
        .eq("setor_id", previousSector.id.toString());

      if (deleteResponsibleError) {
        console.error("Erro ao limpar responsáveis:", deleteResponsibleError);
        // Não falhar completamente se apenas esta etapa falhar
      }

      return true;
    } catch (error) {
      console.error("Erro ao mover processo:", error);
      return false;
    }
  },
  
  /**
   * Inicia um processo (muda status para Em andamento)
   * @param processId ID do processo
   * @param userId ID do usuário que está iniciando o processo
   * @returns true se sucesso, false se erro
   */
  async startProcess(processId: string, userId: string): Promise<boolean> {
    try {
      // 1. Atualizar status do processo
      const { error: updateError } = await supabase
        .from("processos")
        .update({
          status: "Em andamento",
          usuario_responsavel: userId,
          updated_at: new Date().toISOString()
        })
        .eq("id", processId);

      if (updateError) {
        console.error("Erro ao atualizar status do processo:", updateError);
        return false;
      }

      // 2. Adicionar entrada ao histórico se necessário
      // (Isso será tratado pelo sistema existente de movimentação)

      return true;
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      return false;
    }
  },
  
  /**
   * Aceita responsabilidade por um processo em um setor
   * @param processId ID do processo
   * @param sectorId ID do setor
   * @param userId ID do usuário aceitando a responsabilidade
   * @returns true se sucesso, false se erro
   */
  async acceptResponsibility(processId: string, sectorId: string, userId: string): Promise<boolean> {
    try {
      // 1. Verificar se já existe uma responsabilidade
      const { data, error: checkError } = await supabase
        .from("setor_responsaveis")
        .select("id")
        .eq("processo_id", processId)
        .eq("setor_id", sectorId)
        .maybeSingle();

      if (checkError) {
        console.error("Erro ao verificar responsabilidade:", checkError);
        return false;
      }

      // 2. Se já existe, atualizar; caso contrário, criar nova
      if (data) {
        const { error: updateError } = await supabase
          .from("setor_responsaveis")
          .update({
            usuario_id: userId,
            updated_at: new Date().toISOString()
          })
          .eq("id", data.id);

        if (updateError) {
          console.error("Erro ao atualizar responsabilidade:", updateError);
          return false;
        }
      } else {
        const { error: insertError } = await supabase
          .from("setor_responsaveis")
          .insert({
            processo_id: processId,
            setor_id: sectorId,
            usuario_id: userId
          });

        if (insertError) {
          console.error("Erro ao criar responsabilidade:", insertError);
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade:", error);
      return false;
    }
  }
};

export default ProcessMovementService;
