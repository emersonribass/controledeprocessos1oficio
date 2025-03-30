
import { useState } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessesFetch = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcesses = async () => {
    try {
      setIsLoading(true);

      // Buscar processos do Supabase
      const { data: processesData, error: processesError } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `)
        .order('data_inicio', { ascending: false });

      if (processesError) {
        throw processesError;
      }

      // Converter para o formato do nosso tipo Process
      const formattedProcesses: Process[] = processesData.map(process => {
        // Verificar se está atrasado
        const expectedEndDate = new Date(process.data_fim_esperada);
        const now = new Date();
        let status: 'pending' | 'completed' | 'overdue';
        
        if (process.status === 'Concluído') {
          status = 'completed';
        } else if (now > expectedEndDate) {
          status = 'overdue';
        } else {
          status = 'pending';
        }

        // Formatar o histórico
        const history = process.processos_historico.map((h: any) => ({
          departmentId: h.setor_id,
          entryDate: h.data_entrada,
          exitDate: h.data_saida,
          userId: h.usuario_id || "1"
        }));

        return {
          id: process.id,
          protocolNumber: process.numero_protocolo,
          processType: process.tipo_processo,
          currentDepartment: process.setor_atual,
          startDate: process.data_inicio,
          expectedEndDate: process.data_fim_esperada,
          status,
          history
        };
      });

      setProcesses(formattedProcesses);
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os processos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    setProcesses
  };
};
