
import { useState, useCallback } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para gerenciar responsáveis de múltiplos processos
 */
export const useMultipleProcessResponsibles = (processes: Process[] = []) => {
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, string | null>>({});
  
  const fetchMultipleProcessResponsibles = useCallback(async () => {
    if (!processes.length) return;
    
    try {
      const processIds = processes.map(p => p.id);
      const { data, error } = await supabase
        .from('department_responsibles')
        .select('*')
        .in('process_id', processIds);
      
      if (error) throw error;
      
      const newResponsibles: Record<string, string | null> = {};
      if (data) {
        data.forEach(item => {
          newResponsibles[item.process_id] = item.user_id;
        });
      }
      
      setProcessResponsibles(newResponsibles);
    } catch (error) {
      console.error("Erro ao buscar responsáveis dos processos:", error);
    }
  }, [processes]);
  
  return {
    processResponsibles,
    setProcessResponsibles,
    fetchMultipleProcessResponsibles
  };
};
