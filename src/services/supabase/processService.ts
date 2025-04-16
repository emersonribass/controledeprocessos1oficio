
import { supabase } from "@/integrations/supabase/client";
import { Tables } from "@/integrations/supabase/schema";

/**
 * Serviço para gerenciamento de processos
 */
class ProcessService {
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
   * Verifica se um processo está no status "Não iniciado"
   * Útil para o setor de atendimento verificar processos que pode iniciar
   */
  async checkProcessNotStarted(processId: string) {
    console.log(`Verificando se processo ${processId} está não iniciado`);
    return await supabase
      .from('processos')
      .select('id, status')
      .eq('id', processId)
      .eq('status', 'Não iniciado')
      .maybeSingle();
  }
  
  /**
   * Obtém informações básicas sobre um processo para verificação de acesso
   */
  async getProcessBasicInfo(processId: string) {
    console.log(`Obtendo informações básicas do processo ${processId} para verificação de acesso`);
    return await supabase
      .from('processos')
      .select('id, numero_protocolo, usuario_responsavel, setor_atual, status')
      .eq('id', processId)
      .maybeSingle();
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
   * Busca todos os processos
   */
  async getProcessos() {
    return await supabase.from("processos").select("*");
  }

  /**
   * Busca um processo pelo ID
   */
  async getProcessoById(id: string) {
    return await supabase.from("processos").select("*").eq("id", id).single();
  }

  /**
   * Atualiza um processo
   */
  async updateProcesso(id: string, data: Partial<Tables["processos"]>) {
    return await supabase.from("processos").update(data).eq("id", id);
  }

  /**
   * Cria um novo processo
   */
  async createProcesso(data: Omit<Tables["processos"], "id">) {
    return await supabase.from("processos").insert(data);
  }

  /**
   * Remove um processo
   */
  async deleteProcesso(id: string) {
    return await supabase.from("processos").delete().eq("id", id);
  }
}

// Exporta uma instância única do serviço (Singleton)
export const processService = new ProcessService();
