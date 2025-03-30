
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useDepartmentsData } from "./useDepartmentsData";

export const useProcessGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { departments } = useDepartmentsData();

  const generateProcesses = async (
    initialNumber: number,
    quantity: number
  ) => {
    if (quantity <= 0 || initialNumber <= 0) {
      toast({
        title: "Erro",
        description: "O número inicial e a quantidade devem ser maiores que zero.",
        variant: "destructive"
      });
      return false;
    }

    try {
      setIsGenerating(true);

      // Obter o primeiro setor (por ordem)
      const firstDepartment = departments.sort((a, b) => a.order - b.order)[0];
      
      if (!firstDepartment) {
        throw new Error("Nenhum setor encontrado no sistema.");
      }

      // Calcular a data de fim esperada (30 dias a partir de hoje por padrão)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const processesToInsert = [];
      
      // Criar array de processos para inserção
      for (let i = 0; i < quantity; i++) {
        const protocolNumber = `${initialNumber + i}`;
        
        processesToInsert.push({
          numero_protocolo: protocolNumber,
          tipo_processo: "pendente", // Valor padrão para ser atualizado posteriormente
          setor_atual: firstDepartment.id,
          status: "Não iniciado",
          data_inicio: new Date().toISOString(),
          data_fim_esperada: endDate.toISOString()
        });
      }

      // Inserir processos no banco de dados
      const { data: insertedProcesses, error: insertError } = await supabase
        .from('processos')
        .insert(processesToInsert)
        .select();

      if (insertError) {
        throw insertError;
      }

      // Inserir histórico para cada processo
      if (insertedProcesses && insertedProcesses.length > 0) {
        const historicosToInsert = insertedProcesses.map(process => ({
          processo_id: process.id,
          setor_id: firstDepartment.id,
          data_entrada: new Date().toISOString(),
          data_saida: null,
          usuario_id: null
        }));

        const { error: historicoError } = await supabase
          .from('processos_historico')
          .insert(historicosToInsert);

        if (historicoError) {
          console.error("Erro ao inserir históricos:", historicoError);
          // Continuamos mesmo com erro no histórico
        }
      }

      toast({
        title: "Sucesso",
        description: `${quantity} processos gerados com sucesso.`
      });
      return true;
    } catch (error) {
      console.error("Erro ao gerar processos:", error);
      toast({
        title: "Erro",
        description: "Não foi possível gerar os processos.",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsGenerating(false);
    }
  };

  return {
    isGenerating,
    generateProcesses
  };
};
