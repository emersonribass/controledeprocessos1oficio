
import { supabase } from "@/integrations/supabase/client";

/**
 * Serviço base para todos os serviços Supabase
 * Fornece funcionalidades comuns que podem ser usadas por outros serviços
 */
export class BaseService {
  /**
   * Cliente Supabase inicializado
   */
  protected client = supabase;

  /**
   * Método para obter a URL do Supabase
   */
  getUrl(): string {
    return this.client.getUrl();
  }
}
