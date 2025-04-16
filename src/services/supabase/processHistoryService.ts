
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

/**
 * Serviço para gerenciamento de histórico de processos
 */
class ProcessHistoryService {
  /**
   * Busca o histórico de um processo
   */
  async getProcessoHistorico(processoId: string) {
    return await supabase
      .from("processos_historico")
      .select("*")
      .eq("processo_id", processoId)
      .order("data_entrada", { ascending: true });
  }

  /**
   * Cria um novo registro de histórico
   */
  async createProcessoHistorico(data: Omit<Tables["processos_historico"], "id">) {
    return await supabase.from("processos_historico").insert(data);
  }

  /**
   * Atualiza um registro de histórico
   */
  async updateProcessoHistorico(id: number, data: Partial<Tables["processos_historico"]>) {
    return await supabase.from("processos_historico").update(data).eq("id", id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export const processHistoryService = new ProcessHistoryService();
