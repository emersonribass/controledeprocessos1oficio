
import { useState, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useToast } from "@/hooks/use-toast";

export const useSupabaseProcesses = () => {
  const [processes, setProcesses] = useState<Process[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { toast } = useToast();

  useEffect(() => {
    fetchProcesses();
  }, []);

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

  const updateProcessType = async (processId: string, newTypeId: string) => {
    try {
      const now = new Date().toISOString();

      // Atualizar o tipo de processo
      const { error } = await supabase
        .from('processos')
        .update({ 
          tipo_processo: newTypeId,
          updated_at: now
        })
        .eq('id', processId);

      if (error) {
        throw error;
      }

      // Atualizar os processos em memória
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao atualizar tipo de processo:', error);
      throw error;
    }
  };

  const moveProcessToNextDepartment = async (processId: string) => {
    try {
      // Obter informações do processo atual
      const process = processes.find(p => p.id === processId);
      if (!process) return;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept) return;
      
      // Encontrar o próximo departamento na ordem
      const nextDept = departments.find((d) => d.order === currentDept.order + 1);
      
      if (!nextDept) {
        toast({
          title: "Aviso",
          description: "Não há próximo setor disponível",
          variant: "destructive"
        });
        return;
      }

      // Atualizar saída no histórico atual
      const now = new Date().toISOString();
      
      // Buscar o histórico atual sem data de saída
      const { data: currentHistoryData, error: currentHistoryError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', currentDeptId)
        .is('data_saida', null)
        .maybeSingle();

      if (currentHistoryError) {
        throw currentHistoryError;
      }

      // Atualizar a data de saída
      if (currentHistoryData) {
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ data_saida: now })
          .eq('id', currentHistoryData.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Criar novo histórico para o próximo departamento
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: nextDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: "1" // Usuário atual (placeholder)
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Verificar se é o departamento final para marcar como concluído
      const isCompleted = nextDept.order === departments.length;
      const newStatus = isCompleted ? "Concluído" : "Em andamento";

      // Atualizar o processo
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: nextDept.id,
          status: newStatus,
          updated_at: now
        })
        .eq('id', processId);

      if (updateProcessError) {
        throw updateProcessError;
      }

      toast({
        title: "Sucesso",
        description: `Processo movido para ${nextDept.name}`
      });

      // Atualizar os processos em memória
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao mover processo para próximo setor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o processo.",
        variant: "destructive"
      });
    }
  };

  const moveProcessToPreviousDepartment = async (processId: string) => {
    try {
      // Obter informações do processo atual
      const process = processes.find(p => p.id === processId);
      if (!process) return;

      const currentDeptId = process.currentDepartment;
      const currentDept = departments.find((d) => d.id === currentDeptId);
      
      if (!currentDept || currentDept.order <= 1) {
        toast({
          title: "Aviso",
          description: "Não há setor anterior disponível",
          variant: "destructive"
        });
        return;
      }
      
      // Encontrar o departamento anterior na ordem
      const prevDept = departments.find((d) => d.order === currentDept.order - 1);
      
      if (!prevDept) return;

      // Atualizar saída no histórico atual
      const now = new Date().toISOString();
      
      // Buscar o histórico atual sem data de saída
      const { data: currentHistoryData, error: currentHistoryError } = await supabase
        .from('processos_historico')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', currentDeptId)
        .is('data_saida', null)
        .maybeSingle();

      if (currentHistoryError) {
        throw currentHistoryError;
      }

      // Atualizar a data de saída
      if (currentHistoryData) {
        const { error: updateError } = await supabase
          .from('processos_historico')
          .update({ data_saida: now })
          .eq('id', currentHistoryData.id);

        if (updateError) {
          throw updateError;
        }
      }

      // Criar novo histórico para o departamento anterior
      const { error: newHistoryError } = await supabase
        .from('processos_historico')
        .insert({
          processo_id: processId,
          setor_id: prevDept.id,
          data_entrada: now,
          data_saida: null,
          usuario_id: "1" // Usuário atual (placeholder)
        });

      if (newHistoryError) {
        throw newHistoryError;
      }

      // Atualizar o processo
      const { error: updateProcessError } = await supabase
        .from('processos')
        .update({ 
          setor_atual: prevDept.id,
          status: "Em andamento", // Sempre será "Em andamento" ao voltar
          updated_at: now
        })
        .eq('id', processId);

      if (updateProcessError) {
        throw updateProcessError;
      }

      toast({
        title: "Sucesso",
        description: `Processo devolvido para ${prevDept.name}`
      });

      // Atualizar os processos em memória
      await fetchProcesses();
    } catch (error) {
      console.error('Erro ao mover processo para setor anterior:', error);
      toast({
        title: "Erro",
        description: "Não foi possível mover o processo.",
        variant: "destructive"
      });
    }
  };

  return {
    processes,
    isLoading,
    fetchProcesses,
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    updateProcessType
  };
};
