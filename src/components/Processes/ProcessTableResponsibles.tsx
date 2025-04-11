
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Process } from "@/types";

interface ProcessTableResponsiblesProps {
  processes: Process[];
}

const ProcessTableResponsibles = ({ processes }: ProcessTableResponsiblesProps) => {
  const [processResponsibles, setProcessResponsibles] = useState<Record<string, string | null>>({});

  // Efeito para buscar responsáveis dos processos
  useEffect(() => {
    const fetchResponsibles = async () => {
      try {
        if (processes.length === 0) return;
        
        const { data, error } = await supabase
          .from('processos')
          .select('id, usuario_responsavel')
          .in('id', processes.map(p => p.id));
          
        if (error) {
          console.error("Erro ao buscar responsáveis dos processos:", error);
          return;
        }
        
        const responsibles: Record<string, string | null> = {};
        data.forEach(p => {
          responsibles[p.id] = p.usuario_responsavel;
        });
        
        setProcessResponsibles(responsibles);
      } catch (error) {
        console.error("Erro ao processar responsáveis dos processos:", error);
      }
    };
    
    fetchResponsibles();
  }, [processes]);

  const hasProcessResponsible = (processId: string): boolean => {
    return !!processResponsibles[processId];
  };

  return { processResponsibles, hasProcessResponsible };
};

export default ProcessTableResponsibles;
