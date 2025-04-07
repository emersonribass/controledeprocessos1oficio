
import { useState } from "react";
import { supabase, getAdminSupabaseClient } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useProcessFetcher = () => {
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAdmin } = useAuth();

  const fetchProcessesData = async () => {
    try {
      setIsLoading(true);
      console.log("fetchProcessesData: Buscando processos...");
      
      // Use o cliente apropriado baseado no perfil do usuário
      const client = user && isAdmin(user.email) ? getAdminSupabaseClient() : supabase;
      console.log("fetchProcessesData: Cliente Supabase para buscar processos:", isAdmin(user?.email) ? "Admin" : "Regular");
      
      // Buscar todos os processos
      const { data: processesData, error: processesError } = await client
        .from('processos')
        .select('*')
        .order('created_at', { ascending: false });

      if (processesError) {
        console.error("Erro ao buscar processos:", processesError);
        throw processesError;
      }

      console.log(`Processos recuperados: ${processesData.length}`);

      // Buscar histórico de todos os processos
      const { data: historyData, error: historyError } = await client
        .from('processos_historico')
        .select('*')
        .order('data_entrada', { ascending: true });

      if (historyError) {
        console.error("Erro ao buscar histórico dos processos:", historyError);
        throw historyError;
      }

      console.log(`Registros de histórico recuperados: ${historyData.length}`);

      // Retornar dados brutos para serem processados pelo formatter
      return {
        processes: processesData || [],
        history: historyData || []
      };
    } catch (error) {
      console.error("Erro ao buscar dados dos processos:", error);
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
