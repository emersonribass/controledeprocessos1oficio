
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/auth";

export const useProcessStart = () => {
  const { toast } = useToast();
  const { user } = useAuth();

  const startProcess = async (processId: string) => {
    try {
      // Verificar se o usuário está autenticado
      if (!user || !user.id) {
        throw new Error("Usuário não autenticado");
      }

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
      
      // Atualizar o processo com o usuário responsável principal e mudar para o primeiro setor
      const { error: updateError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: firstDept.id.toString(),
          status: "Em andamento",
          data_inicio: now,
          updated_at: now,
          usuario_responsavel: user.id // Define o usuário que iniciou como responsável principal
        })
        .eq('id', processId);
        
      if (updateError) {
        throw updateError;
      }
      
      // Registrar na tabela de histórico, já definindo o usuário como responsável pelo setor também
      const { error: historyError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: firstDept.id.toString(),
          data_entrada: now,
          data_saida: null,
          usuario_id: user.id,
          usuario_responsavel_setor: user.id // O iniciador já é automaticamente responsável pelo primeiro setor
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
