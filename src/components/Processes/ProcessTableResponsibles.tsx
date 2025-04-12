
import { useState, useEffect } from "react";
import { Process } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export interface ProcessResponsiblesHookResult {
  hasProcessResponsible: (processId: string) => boolean;
  isUserProcessResponsible: (processId: string) => boolean;
  processResponsibles: Record<string, string | null>;
  setProcessResponsibles: React.Dispatch<React.SetStateAction<Record<string, string | null>>>;
}

interface ProcessResponsiblesHookProps {
  processes: Process[];
}

type ProcessResponsible = {
  id: string;
  usuario_responsavel: string | null;
};

const ProcessTableResponsibles = ({ processes }: ProcessResponsiblesHookProps): ProcessResponsiblesHookResult => {
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, string | null>>({});
  const { user } = useAuth();
  
  // Efeito para buscar informações sobre responsáveis de processos
  useEffect(() => {
    const checkProcessResponsibles = async () => {
      try {
        // Obter IDs de todos os processos
        const processIds = processes.map(process => process.id);
        
        if (processIds.length === 0) return;
        
        // Buscar informações de responsáveis para todos os processos
        const { data, error } = await supabase
          .from('processos')
          .select('id, usuario_responsavel')
          .in('id', processIds);
        
        if (error) {
          console.error("Erro ao buscar responsáveis dos processos:", error);
          return;
        }
        
        // Mapear os resultados para o estado
        const newResponsibles: Record<string, string | null> = {};
        (data as ProcessResponsible[]).forEach(item => {
          // Marcar como tendo responsável se tiver usuário_responsavel
          newResponsibles[item.id] = item.usuario_responsavel;
        });
        
        setProcessResponsibles(newResponsibles);
      } catch (error) {
        console.error("Erro ao verificar responsáveis dos processos:", error);
      }
    };
    
    checkProcessResponsibles();
  }, [processes]);

  /**
   * Verifica se um processo tem algum responsável
   */
  const hasProcessResponsible = (processId: string): boolean => {
    return !!processResponsibles[processId];
  };
  
  /**
   * Verifica se o usuário atual é responsável pelo processo
   */
  const isUserProcessResponsible = (processId: string): boolean => {
    const process = processes.find(p => p.id === processId);
    return !!user && !!process && process.responsibleUser === user.id;
  };

  return { 
    hasProcessResponsible, 
    isUserProcessResponsible,
    processResponsibles, 
    setProcessResponsibles 
  };
};

export default ProcessTableResponsibles;
