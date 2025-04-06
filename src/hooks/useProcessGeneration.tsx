
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useProcessGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

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
      
      // Calcular a data de fim esperada (30 dias a partir de hoje por padrão)
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + 30);
      
      const processesToInsert = [];
      
      // Criar array de processos para inserção (sem setor atribuído inicialmente)
      for (let i = 0; i < quantity; i++) {
        const protocolNumber = `${initialNumber + i}`;
        
        processesToInsert.push({
          numero_protocolo: protocolNumber,
          tipo_processo: "pendente", // Valor padrão para ser atualizado posteriormente
          setor_atual: null, // Sem setor atribuído inicialmente
          status: "Não iniciado",
          data_inicio: null, // Definimos como null e será atribuído apenas quando iniciar o processo
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
