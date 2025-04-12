
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";
import { UsuarioSupabase } from "@/types/usuario";
import { ProcessType } from "@/types";

/**
 * Classe de serviço para interação com o Supabase
 * Centraliza chamadas de API e implementa o padrão DRY
 */
class SupabaseService {
  // Método para obter a URL do Supabase
  getUrl(): string {
    return supabase.getUrl();
  }

  // ===== Serviços para Usuários =====
  
  /**
   * Busca todos os usuários no sistema
   */
  async fetchUsuarios() {
    return await supabase
      .from("usuarios")
      .select("*", { count: 'exact' })
      .order("nome");
  }
  
  /**
   * Verifica usuários no sistema de autenticação
   */
  async checkAuthUsers() {
    return await supabase.auth.admin.listUsers();
  }
  
  /**
   * Atualiza um usuário existente
   */
  async updateUsuario(id: string, data: Partial<UsuarioSupabase>) {
    return await supabase
      .from("usuarios")
      .update(data)
      .eq("id", id);
  }
  
  /**
   * Cria um novo usuário
   */
  async createUsuario(data: Omit<UsuarioSupabase, "id" | "created_at" | "updated_at">) {
    return await supabase.from("usuarios").insert(data);
  }
  
  /**
   * Remove um usuário
   */
  async deleteUsuario(id: string) {
    return await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);
  }
  
  /**
   * Alterna o status ativo/inativo de um usuário
   */
  async toggleUsuarioAtivo(id: string, ativo: boolean) {
    return await supabase
      .from("usuarios")
      .update({ ativo: !ativo })
      .eq("id", id);
  }

  // ===== Serviços para Tipos de Processo =====
  
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
    return await supabase
      .from('tipos_processo')
      .insert([{ name, description }])
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

  // ===== Serviços para Processos =====
  
  /**
   * Atualiza o tipo de um processo
   */
  async updateProcessType(processId: string, newTypeId: string) {
    return await supabase
      .from('processos')
      .update({ tipo_processo: newTypeId })
      .eq('id', processId);
  }
  
  /**
   * Atualiza o status de um processo
   */
  async updateProcessStatus(processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') {
    return await supabase
      .from('processos')
      .update({ status: newStatus })
      .eq('id', processId);
  }
  
  /**
   * Busca um processo específico com seu histórico
   */
  async getProcess(processId: string) {
    return await supabase
      .from('processos')
      .select(`
        *,
        processos_historico(*)
      `)
      .eq('id', processId)
      .single();
  }
}

// Exporta uma instância única do serviço (Singleton)
export const supabaseService = new SupabaseService();
