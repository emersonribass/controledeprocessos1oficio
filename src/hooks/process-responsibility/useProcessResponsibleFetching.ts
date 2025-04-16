
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export const useProcessResponsibleFetching = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  /**
   * Busca o responsável principal de um processo
   */
  const getProcessResponsible = useCallback(async (processId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      // Buscar o processo para obter o ID do responsável
      const { data: process, error: processError } = await supabase
        .from('processos')
        .select('usuario_responsavel')
        .eq('id', processId)
        .maybeSingle();
      
      if (processError) {
        console.error("Erro ao buscar processo:", processError);
        return null;
      }
      
      if (!process || !process.usuario_responsavel) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', process.usuario_responsavel)
        .maybeSingle();
      
      if (userError) {
        console.error("Erro ao buscar usuário responsável:", userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error("Erro ao buscar responsável do processo:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  /**
   * Busca o responsável de um processo em um setor específico
   */
  const getSectorResponsible = useCallback(async (processId: string, sectorId: string) => {
    if (!user) return null;
    
    setIsLoading(true);
    try {
      // Buscar o responsável do setor
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('usuario_id')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao buscar responsável do setor:", error);
        return null;
      }
      
      if (!data || !data.usuario_id) {
        return null;
      }
      
      // Buscar dados do usuário responsável
      const { data: responsibleUser, error: userError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('id', data.usuario_id)
        .maybeSingle();
      
      if (userError) {
        console.error("Erro ao buscar usuário responsável pelo setor:", userError);
        return null;
      }
      
      return responsibleUser;
    } catch (error) {
      console.error("Erro ao buscar responsável do setor:", error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    getProcessResponsible,
    getSectorResponsible,
    isLoading
  };
};
