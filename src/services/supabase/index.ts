
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

  // ===== Serviços para Processos =====
  
  /**
   * Atualiza o tipo de um processo
   */
  async updateProcessTypeById(processId: string, newTypeId: string) {
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
   * As políticas RLS já garantem que apenas processos autorizados sejam retornados
   */
  async getProcess(processId: string) {
    console.log(`Executando consulta para processo ${processId} com RLS ativo`);
    return await supabase
      .from('processos')
      .select(`
        *,
        processos_historico(*)
      `)
      .eq('id', processId)
      .maybeSingle(); // Usando maybeSingle para evitar erros se o processo não for encontrado
  }
  
  /**
   * Verifica se um usuário tem acesso a um processo específico baseado em RLS
   */
  async checkProcessAccess(processId: string) {
    console.log(`Verificando acesso ao processo ${processId}`);
    const { data, error } = await supabase
      .from('processos')
      .select('id, numero_protocolo, usuario_responsavel, setor_atual')
      .eq('id', processId)
      .maybeSingle();
      
    if (error) {
      console.error('Erro ao verificar acesso:', error);
      return false;
    }
    
    // Se retornou dados, o usuário tem acesso (RLS garantiu isso)
    const hasAccess = !!data;
    console.log(`Acesso ao processo ${processId}: ${hasAccess ? 'Permitido' : 'Negado'}`);
    if (hasAccess) {
      console.log(`Informações do processo: Protocolo ${data.numero_protocolo}, Responsável: ${data.usuario_responsavel}, Setor: ${data.setor_atual}`);
    }
    
    return hasAccess;
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
   * Busca perfil do usuário pelo ID
   */
  async getUserProfile(userId: string) {
    console.log(`Buscando perfil do usuário: ${userId}`);
    return await supabase
      .from('usuarios')
      .select('id, perfil, setores_atribuidos, nome, email')
      .eq('id', userId)
      .maybeSingle();
  }
}

// Exporta uma instância única do serviço (Singleton)
export const supabaseService = new SupabaseService();
