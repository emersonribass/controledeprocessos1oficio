
import { supabase } from "@/integrations/supabase/client";
import { processDataService } from "./ProcessDataService";
import { Process, User } from "@/types";

class ProcessMovementService {
  /**
   * Move um processo para o próximo departamento
   */
  async moveToNextDepartment(processId: string): Promise<boolean> {
    try {
      // Obter o processo atual
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();
      
      if (processError || !process) {
        console.error("Erro ao obter processo:", processError);
        return false;
      }
      
      // Obter o departamento atual
      const { data: currentDept, error: deptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', process.setor_atual)
        .single();
      
      if (deptError || !currentDept) {
        console.error("Erro ao obter departamento atual:", deptError);
        return false;
      }
      
      // Buscar o próximo departamento
      const { data: nextDept, error: nextDeptError } = await supabase
        .from('setores')
        .select('*')
        .gt('order_num', currentDept.order_num)
        .order('order_num', { ascending: true })
        .limit(1)
        .single();
      
      if (nextDeptError || !nextDept) {
        console.error("Erro ao obter próximo departamento:", nextDeptError);
        return false;
      }
      
      // Registrar saída do departamento atual
      const { error: exitError } = await supabase
        .from('processos_historico')
        .update({ data_saida: new Date().toISOString() })
        .eq('processo_id', processId)
        .eq('setor_id', process.setor_atual)
        .is('data_saida', null);
      
      if (exitError) {
        console.error("Erro ao registrar saída do departamento atual:", exitError);
        return false;
      }
      
      // Registrar entrada no próximo departamento
      const { error: entryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: nextDept.id.toString(),
          data_entrada: new Date().toISOString()
        });
      
      if (entryError) {
        console.error("Erro ao registrar entrada no próximo departamento:", entryError);
        return false;
      }
      
      // Atualizar o processo com o novo departamento
      const { error: updateError } = await supabase
        .from('processos')
        .update({ setor_atual: nextDept.id.toString() })
        .eq('id', processId);
      
      if (updateError) {
        console.error("Erro ao atualizar departamento do processo:", updateError);
        return false;
      }
      
      // Limpar o cache de responsáveis
      processDataService.clearCache();
      
      return true;
    } catch (error) {
      console.error("Erro ao mover processo para o próximo departamento:", error);
      return false;
    }
  }

  /**
   * Move um processo para o departamento anterior
   */
  async moveToPreviousDepartment(processId: string): Promise<boolean> {
    try {
      // Obter o processo atual
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();
      
      if (processError || !process) {
        console.error("Erro ao obter processo:", processError);
        return false;
      }
      
      // Obter o departamento atual
      const { data: currentDept, error: deptError } = await supabase
        .from('setores')
        .select('*')
        .eq('id', process.setor_atual)
        .single();
      
      if (deptError || !currentDept) {
        console.error("Erro ao obter departamento atual:", deptError);
        return false;
      }
      
      // Buscar o departamento anterior
      const { data: prevDept, error: prevDeptError } = await supabase
        .from('setores')
        .select('*')
        .lt('order_num', currentDept.order_num)
        .order('order_num', { ascending: false })
        .limit(1)
        .single();
      
      if (prevDeptError || !prevDept) {
        console.error("Erro ao obter departamento anterior:", prevDeptError);
        return false;
      }
      
      // Registrar saída do departamento atual
      const { error: exitError } = await supabase
        .from('processos_historico')
        .update({ data_saida: new Date().toISOString() })
        .eq('processo_id', processId)
        .eq('setor_id', process.setor_atual)
        .is('data_saida', null);
      
      if (exitError) {
        console.error("Erro ao registrar saída do departamento atual:", exitError);
        return false;
      }
      
      // Registrar entrada no departamento anterior
      const { error: entryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: prevDept.id.toString(),
          data_entrada: new Date().toISOString()
        });
      
      if (entryError) {
        console.error("Erro ao registrar entrada no departamento anterior:", entryError);
        return false;
      }
      
      // Remover o responsável atual
      // Regra 6: Ao retornar a um setor, limpar o responsável
      await this.clearSectorResponsible(processId, prevDept.id.toString());
      
      // Atualizar o processo com o novo departamento
      const { error: updateError } = await supabase
        .from('processos')
        .update({ setor_atual: prevDept.id.toString() })
        .eq('id', processId);
      
      if (updateError) {
        console.error("Erro ao atualizar departamento do processo:", updateError);
        return false;
      }
      
      // Limpar o cache de responsáveis
      processDataService.clearCache();
      
      return true;
    } catch (error) {
      console.error("Erro ao mover processo para o departamento anterior:", error);
      return false;
    }
  }

  /**
   * Inicia um processo
   */
  async startProcess(processId: string, userId: string): Promise<boolean> {
    try {
      // Obter o processo atual
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('*')
        .eq('id', processId)
        .single();
      
      if (processError || !process) {
        console.error("Erro ao obter processo:", processError);
        return false;
      }

      // Obter o primeiro departamento (ordem 1 - ATENDIMENTO)
      const { data: firstDept, error: deptError } = await supabase
        .from('setores')
        .select('*')
        .eq('order_num', 1)
        .single();
      
      if (deptError || !firstDept) {
        console.error("Erro ao obter primeiro departamento:", deptError);
        return false;
      }

      // Definir data de início
      const startDate = new Date().toISOString();
      
      // Calcular data fim esperada (30 dias úteis após início)
      const expectedEndDate = new Date();
      expectedEndDate.setDate(expectedEndDate.getDate() + 30); // Simplificado para 30 dias corridos
      
      // Atualizar o processo para "Em andamento"
      const { error: updateError } = await supabase
        .from('processos')
        .update({
          status: 'Em andamento',
          setor_atual: firstDept.id.toString(),
          data_inicio: startDate,
          data_fim_esperada: expectedEndDate.toISOString(),
          usuario_responsavel: userId
        })
        .eq('id', processId);
      
      if (updateError) {
        console.error("Erro ao iniciar processo:", updateError);
        return false;
      }
      
      // Registrar entrada no primeiro departamento
      const { error: entryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: firstDept.id.toString(),
          data_entrada: startDate,
          usuario_id: userId
        });
      
      if (entryError) {
        console.error("Erro ao registrar entrada no primeiro departamento:", entryError);
        return false;
      }

      // Limpar o cache de responsáveis
      processDataService.clearCache();
      
      return true;
    } catch (error) {
      console.error("Erro ao iniciar processo:", error);
      return false;
    }
  }

  /**
   * Aceita responsabilidade por um processo em um setor específico
   */
  async acceptResponsibility(processId: string, sectorId: string, userId: string): Promise<boolean> {
    try {
      // Verificar se já existe responsável para este setor
      const { count, error: countError } = await supabase
        .from('setor_responsaveis')
        .select('*', { count: 'exact', head: true })
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (countError) {
        console.error("Erro ao verificar responsáveis existentes:", countError);
        return false;
      }
      
      // Se já existe responsável, retornar erro
      if (count && count > 0) {
        console.error("Já existe um responsável para este processo neste setor.");
        return false;
      }
      
      // Registrar o novo responsável
      const { error: insertError } = await supabase
        .from('setor_responsaveis')
        .insert({
          processo_id: processId,
          setor_id: sectorId,
          usuario_id: userId
        });
      
      if (insertError) {
        console.error("Erro ao registrar responsabilidade:", insertError);
        return false;
      }
      
      // Limpar o cache de responsáveis
      processDataService.clearCache();
      
      return true;
    } catch (error) {
      console.error("Erro ao aceitar responsabilidade pelo processo:", error);
      return false;
    }
  }

  /**
   * Remove o responsável de um setor específico
   */
  async clearSectorResponsible(processId: string, sectorId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('setor_responsaveis')
        .delete()
        .eq('processo_id', processId)
        .eq('setor_id', sectorId);
      
      if (error) {
        console.error("Erro ao remover responsável do setor:", error);
        return false;
      }
      
      // Limpar o cache de responsáveis
      processDataService.clearCache();
      
      return true;
    } catch (error) {
      console.error("Erro ao limpar responsável do setor:", error);
      return false;
    }
  }
}

// Exportar uma instância única do serviço
export const processMovementService = new ProcessMovementService();
