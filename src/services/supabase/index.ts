
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";
import { UsuarioSupabase } from "@/types/usuario";
import { ProcessType } from "@/types";

/**
 * Classe de serviço para interação com o Supabase
 * Centraliza chamadas de API e implementa o padrão DRY
 */
class SupabaseService {
  // Cache interno
  private cache: {
    usuarios?: {
      data: any;
      timestamp: number;
    };
    processTypes?: {
      data: any;
      timestamp: number;
    };
  } = {};

  private CACHE_TTL = 60000; // 1 minuto

  private isCacheValid(cacheKey: 'usuarios' | 'processTypes'): boolean {
    const cache = this.cache[cacheKey];
    return !!cache && Date.now() - cache.timestamp < this.CACHE_TTL;
  }

  // Método para obter a URL do Supabase
  getUrl(): string {
    return supabase.getUrl();
  }

  // ===== Serviços para Usuários =====
  
  /**
   * Busca todos os usuários no sistema
   */
  async fetchUsuarios() {
    // Verificar cache
    if (this.isCacheValid('usuarios')) {
      console.log("Retornando usuários do cache");
      return this.cache.usuarios!.data;
    }

    console.log("Iniciando busca de usuários na tabela 'usuarios' do projeto controledeprocessos1oficio");
    console.log("URL do Supabase:", this.getUrl());
    
    const result = await supabase
      .from("usuarios")
      .select("*", { count: 'exact' })
      .order("nome");
    
    // Armazenar no cache
    if (!result.error) {
      this.cache.usuarios = {
        data: result,
        timestamp: Date.now()
      };
      console.log(`Encontrados ${result.count} usuários na tabela 'usuarios':`, result.data);
    }
    
    return result;
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
    // Invalidar cache após atualização
    if (this.cache.usuarios) {
      delete this.cache.usuarios;
    }
    
    return await supabase
      .from("usuarios")
      .update(data)
      .eq("id", id);
  }
  
  /**
   * Cria um novo usuário
   */
  async createUsuario(data: Omit<UsuarioSupabase, "id" | "created_at" | "updated_at">) {
    // Invalidar cache após criação
    if (this.cache.usuarios) {
      delete this.cache.usuarios;
    }
    
    return await supabase.from("usuarios").insert(data);
  }
  
  /**
   * Remove um usuário
   */
  async deleteUsuario(id: string) {
    // Invalidar cache após remoção
    if (this.cache.usuarios) {
      delete this.cache.usuarios;
    }
    
    return await supabase
      .from("usuarios")
      .delete()
      .eq("id", id);
  }
  
  /**
   * Alterna o status ativo/inativo de um usuário
   */
  async toggleUsuarioAtivo(id: string, ativo: boolean) {
    // Invalidar cache após alteração
    if (this.cache.usuarios) {
      delete this.cache.usuarios;
    }
    
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
    // Verificar cache
    if (this.isCacheValid('processTypes')) {
      return this.cache.processTypes!.data;
    }
    
    const result = await supabase
      .from('tipos_processo')
      .select('*')
      .order('name');
      
    // Armazenar no cache
    if (!result.error) {
      this.cache.processTypes = {
        data: result,
        timestamp: Date.now()
      };
    }
    
    return result;
  }
  
  /**
   * Cria um novo tipo de processo
   */
  async createProcessType(name: string, description?: string) {
    // Invalidar cache após criação
    if (this.cache.processTypes) {
      delete this.cache.processTypes;
    }
    
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
    // Invalidar cache após atualização
    if (this.cache.processTypes) {
      delete this.cache.processTypes;
    }
    
    return await supabase
      .from('tipos_processo')
      .update(data)
      .eq('id', id);
  }
  
  /**
   * Alterna o status ativo/inativo de um tipo de processo
   */
  async toggleProcessTypeActive(id: string, active: boolean) {
    // Invalidar cache após alteração
    if (this.cache.processTypes) {
      delete this.cache.processTypes;
    }
    
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
  async updateProcessStatus(processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') {
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
  
  /**
   * Limpa todo o cache armazenado
   */
  clearCache() {
    this.cache = {};
    console.log("Cache do serviço Supabase limpo");
  }
}

// Exporta uma instância única do serviço (Singleton)
export const supabaseService = new SupabaseService();
