
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { saveDateToDatabase } from "@/utils/dateUtils";

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
      
      const processesToInsert = [];
      const now = new Date(); // Criar uma nova data
      const nowISO = saveDateToDatabase(now); // Usar a nova função para converter para o formato ISO no fuso de Brasília
      
      for (let i = 0; i < quantity; i++) {
        const protocolNumber = `${initialNumber + i}`;
        
        processesToInsert.push({
          numero_protocolo: protocolNumber,
          tipo_processo: "pendente",
          setor_atual: null,
          status: "Não iniciado",
          data_inicio: null,
          data_fim_esperada: null,
          created_at: nowISO, // Usar o timestamp já convertido
          updated_at: nowISO // Usar o timestamp já convertido
        });
      }

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

