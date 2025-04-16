
import { supabase } from "@/integrations/supabase/client";
import { ToastService } from "@/services/toast/toastService";
import { UsuarioSupabase } from "@/types/usuario";

/**
 * Serviço para gerenciar operações relacionadas a usuários
 */
export class UserService {
  /**
   * Obtém um usuário pelo ID
   * @param userId ID do usuário
   * @returns Dados do usuário ou null se não encontrado
   */
  static async getUserById(userId: string): Promise<UsuarioSupabase | null> {
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userId)
        .single();

      if (error) {
        throw error;
      }

      return data as UsuarioSupabase;
    } catch (error) {
      console.error("Erro ao buscar usuário por ID:", error);
      ToastService.error("Erro ao buscar dados do usuário");
      return null;
    }
  }

  /**
   * Obtém o nome do usuário pelo ID
   * @param userId ID do usuário
   * @returns Nome do usuário ou string vazia se não encontrado
   */
  static async getUserName(userId: string): Promise<string> {
    try {
      const user = await this.getUserById(userId);
      return user ? user.nome : "";
    } catch (error) {
      console.error("Erro ao buscar nome do usuário:", error);
      return "";
    }
  }

  /**
   * Verifica se um usuário é administrador
   * @param userId ID do usuário
   * @returns true se for admin, false caso contrário
   */
  static async isUserAdmin(userId: string): Promise<boolean> {
    try {
      const user = await this.getUserById(userId);
      return user ? user.perfil === 'administrador' : false;
    } catch (error) {
      console.error("Erro ao verificar status de administrador:", error);
      return false;
    }
  }
}
