
import { supabase } from "@/integrations/supabase/client";
import { UsuarioSupabase } from "@/types/usuario";

/**
 * Serviço para gerenciamento de usuários
 */
class UserService {
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
export const userService = new UserService();
