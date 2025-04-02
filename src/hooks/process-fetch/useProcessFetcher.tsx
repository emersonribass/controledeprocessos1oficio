
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const fetchProcessesData = async () => {
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

      return processesData || [];
    } catch (error) {
      console.error('Erro ao buscar processos:', error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar os processos.",
        variant: "destructive"
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchProcessesData,
    isLoading,
    setIsLoading
  };
};
