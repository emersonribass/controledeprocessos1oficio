
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

/**
 * Serviço para gerenciamento de setores
 */
class DepartmentService {
  /**
   * Busca todos os setores
   */
  async getSetores() {
    return await supabase
      .from("setores")
      .select("*")
      .order("order_num", { ascending: true });
  }

  /**
   * Atualiza um setor
   */
  async updateSetor(id: number, data: Partial<Tables["setores"]>) {
    return await supabase.from("setores").update(data).eq("id", id);
  }

  /**
   * Remove um setor
   */
  async deleteSetor(id: number) {
    return await supabase.from("setores").delete().eq("id", id);
  }

  /**
   * Cria um novo setor
   */
  async createSetor(data: Omit<Tables["setores"], "id">) {
    return await supabase.from("setores").insert(data);
  }
  
  /**
   * Busca responsáveis por processos em seus setores atuais
   * Útil para exibir informações de responsabilidade na interface
   */
  async getProcessResponsibles(processId: string, sectorId: string) {
    console.log(`Buscando responsável para o processo ${processId} no setor ${sectorId}`);
    
    const { data, error } = await supabase
      .from('setor_responsaveis')
      .select(`
        *,
        usuarios:usuario_id (id, nome, email)
      `)
      .eq('processo_id', processId)
      .eq('setor_id', sectorId);
      
    if (error) {
      console.error('Erro ao buscar responsáveis:', error);
      return null;
    }
    
    if (!data || data.length === 0) {
      console.log('Nenhum responsável encontrado para este setor');
      return null;
    }
    
    // Retorna o primeiro responsável encontrado
    return data[0];
  }
  
  /**
   * Busca responsáveis por setor
   */
  async getSetorResponsaveis(processoId: string, setorId: string) {
    return await supabase
      .from("setor_responsaveis")
      .select("*")
      .eq("processo_id", processoId)
      .eq("setor_id", setorId);
  }

  /**
   * Cria um novo responsável por setor
   */
  async createSetorResponsavel(data: Omit<Tables["setor_responsaveis"], "id">) {
    return await supabase.from("setor_responsaveis").insert(data);
  }

  /**
   * Atualiza um responsável por setor
   */
  async updateSetorResponsavel(id: string, data: Partial<Tables["setor_responsaveis"]>) {
    return await supabase.from("setor_responsaveis").update(data).eq("id", id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export const departmentService = new DepartmentService();
