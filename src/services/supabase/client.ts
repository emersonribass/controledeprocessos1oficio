
import { supabase } from "@/integrations/supabase/client";
import { BaseService } from "./baseService";

/**
 * Serviço base que contém o cliente Supabase configurado
 */
class SupabaseBaseService extends BaseService {
  // Métodos adicionais específicos para o serviço base podem ser adicionados aqui
}

// Exporta o serviço base para uso em outras classes
export const supabaseBaseService = new SupabaseBaseService();
