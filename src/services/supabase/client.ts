
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço base que contém o cliente Supabase configurado
 */
class SupabaseBaseService {
  /**
   * Método para obter a URL do Supabase
   */
  getUrl(): string {
    return supabase.getUrl();
  }
}

// Exporta o serviço base para uso em outras classes
export const supabaseBaseService = new SupabaseBaseService();
