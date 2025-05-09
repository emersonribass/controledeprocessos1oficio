
import { supabase } from "@/integrations/supabase/client";
import { createLogger } from "@/utils/loggerUtils";

const logger = createLogger("supabaseService");

export const supabaseService = {
  // Métodos para processos
  updateProcessTypeById: async (processId: string, newTypeId: string) => {
    logger.debug(`Atualizando tipo do processo ${processId} para ${newTypeId}`);
    const { data, error } = await supabase
      .from("processos")
      .update({ tipo_processo: newTypeId, updated_at: new Date().toISOString() })
      .eq("id", processId);
      
    if (error) {
      logger.error(`Erro ao atualizar tipo do processo ${processId}:`, error);
    } else {
      logger.debug(`Tipo do processo ${processId} atualizado com sucesso`);
    }
    
    return { data, error };
  },
  
  updateProcessStatus: async (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado' | 'Arquivado') => {
    logger.debug(`Atualizando status do processo ${processId} para ${newStatus}`);
    const { data, error } = await supabase
      .from("processos")
      .update({ status: newStatus, updated_at: new Date().toISOString() })
      .eq("id", processId);
      
    if (error) {
      logger.error(`Erro ao atualizar status do processo ${processId}:`, error);
    } else {
      logger.debug(`Status do processo ${processId} atualizado com sucesso para ${newStatus}`);
    }
    
    return { data, error };
  },
  
  getProcess: async (processId: string) => {
    logger.debug(`Buscando processo ${processId}`);
    const { data, error } = await supabase
      .from("processos")
      .select(`
        *,
        processos_historico(*)
      `)
      .eq("id", processId)
      .single();
      
    if (error) {
      logger.error(`Erro ao buscar processo ${processId}:`, error);
    } else {
      logger.debug(`Processo ${processId} encontrado`);
    }
    
    return { data, error };
  },
  
  // Métodos para tipos de processo
  fetchProcessTypes: async () => {
    logger.debug("Buscando tipos de processo");
    const { data, error } = await supabase
      .from("tipos_processo")
      .select("*")
      .order("name", { ascending: true });
      
    if (error) {
      logger.error("Erro ao buscar tipos de processo:", error);
    } else {
      logger.debug(`${data?.length || 0} tipos de processo encontrados`);
    }
    
    return { data, error };
  },
  
  createProcessType: async (name: string) => {
    logger.debug(`Criando tipo de processo: ${name}`);
    const { data, error } = await supabase
      .from("tipos_processo")
      .insert({ name, id: crypto.randomUUID() })
      .select()
      .single();
      
    if (error) {
      logger.error(`Erro ao criar tipo de processo ${name}:`, error);
    } else {
      logger.debug(`Tipo de processo ${name} criado com sucesso`);
    }
    
    return { data, error };
  },
  
  updateProcessType: async (id: string, updates: { name?: string; active?: boolean }) => {
    logger.debug(`Atualizando tipo de processo ${id}:`, updates);
    const { data, error } = await supabase
      .from("tipos_processo")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id);
      
    if (error) {
      logger.error(`Erro ao atualizar tipo de processo ${id}:`, error);
    } else {
      logger.debug(`Tipo de processo ${id} atualizado com sucesso`);
    }
    
    return { data, error };
  },
  
  toggleProcessTypeActive: async (id: string, active: boolean) => {
    logger.debug(`${active ? 'Ativando' : 'Desativando'} tipo de processo ${id}`);
    const { data, error } = await supabase
      .from("tipos_processo")
      .update({ active, updated_at: new Date().toISOString() })
      .eq("id", id);
      
    if (error) {
      logger.error(`Erro ao ${active ? 'ativar' : 'desativar'} tipo de processo ${id}:`, error);
    } else {
      logger.debug(`Tipo de processo ${id} ${active ? 'ativado' : 'desativado'} com sucesso`);
    }
    
    return { data, error };
  }
};

export default supabaseService;
