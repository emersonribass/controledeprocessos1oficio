
import { supabase } from "@/integrations/supabase/client";
import { ProcessType } from "@/types";

/**
 * Serviço para gerenciamento de tipos de processo
 */
class ProcessTypeService {
  /**
   * Busca todos os tipos de processo
   */
  async fetchProcessTypes() {
    return await supabase
      .from('tipos_processo')
      .select('*')
      .order('name');
  }
  
  /**
   * Cria um novo tipo de processo
   */
  async createProcessType(name: string, description?: string) {
    // Corrigido para incluir campo id que é obrigatório
    const id = crypto.randomUUID();
    return await supabase
      .from('tipos_processo')
      .insert([{ id, name, description }])
      .select();
  }
  
  /**
   * Atualiza um tipo de processo existente
   */
  async updateProcessType(id: string, data: Partial<ProcessType>) {
    return await supabase
      .from('tipos_processo')
      .update(data)
      .eq('id', id);
  }
  
  /**
   * Alterna o status ativo/inativo de um tipo de processo
   */
  async toggleProcessTypeActive(id: string, active: boolean) {
    return await supabase
      .from('tipos_processo')
      .update({ active })
      .eq('id', id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export const processTypeService = new ProcessTypeService();
