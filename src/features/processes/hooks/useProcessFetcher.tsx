
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      
      // Buscar todos os processos
      const { data: processos, error: processosError } = await supabase
        .from("processos")
        .select("*")
        .order("numero_protocolo", { ascending: true });

      if (processosError) throw processosError;

      // Buscar o histórico dos processos
      const { data: historico, error: historicoError } = await supabase
        .from("processos_historico")
        .select("*")
        .order("data_entrada", { ascending: true });

      if (historicoError) throw historicoError;

      // Mapear processos e seus históricos
      const processosComHistorico = processos?.map(processo => {
        const historicoDoProcesso = historico?.filter(h => h.processo_id === processo.id) || [];
        return {
          ...processo,
          historico: historicoDoProcesso
        };
      }) || [];

      return processosComHistorico;
    } catch (error) {
      console.error("Erro ao buscar dados dos processos:", error);
      toast.error("Erro ao carregar processos");
      throw error;
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
