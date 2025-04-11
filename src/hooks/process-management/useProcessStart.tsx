
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

export const useProcessStart = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const startProcess = async (processId: string) => {
    try {
      // Buscar o primeiro departamento (ordem = 1)
      const { data: departments, error: deptError } = await supabase
        .from('setores')
        .select('*')
        .eq('order_num', 1);
      
      if (deptError || !departments.length) {
        throw new Error("Setor de atendimento não encontrado");
      }
      
      const firstDept = departments[0];
      const now = new Date().toISOString();
      
      if (!user || !user.id) {
        throw new Error("Usuário não autenticado");
      }
      
      // Atualizar o processo
      const { error: updateError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: firstDept.id.toString(),
          status: "Em andamento",
          data_inicio: now,
          updated_at: now
        })
        .eq('id', processId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Registrar na tabela de histórico
      const { error: historyError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: firstDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id
        });
        
      if (historyError) {
        throw historyError;
      }
      
      toast({
        title: "Sucesso",
        description: `Processo iniciado e movido para ${firstDept.name}`
      });
      
      return true;
      
    } catch (error) {
      console.error('Erro ao iniciar processo:', error);
      toast({
        title: "Erro",
        description: "Não foi possível iniciar o processo.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    startProcess
  };
};
