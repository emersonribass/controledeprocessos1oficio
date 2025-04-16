
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

/**
 * Serviço para gerenciamento de notificações
 */
class NotificationService {
  /**
   * Busca notificações de um usuário
   */
  async getNotificacoes(usuarioId: string) {
    return await supabase
      .from("notificacoes")
      .select("*")
      .eq("usuario_id", usuarioId)
      .order("data_criacao", { ascending: false });
  }

  /**
   * Cria uma nova notificação
   */
  async createNotificacao(data: Omit<Tables["notificacoes"], "id">) {
    return await supabase.from("notificacoes").insert(data);
  }

  /**
   * Atualiza uma notificação
   */
  async updateNotificacao(id: string, data: Partial<Tables["notificacoes"]>) {
    return await supabase.from("notificacoes").update(data).eq("id", id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export const notificationService = new NotificationService();
