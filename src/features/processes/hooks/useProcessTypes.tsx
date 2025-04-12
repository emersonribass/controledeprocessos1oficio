
import { useState, useEffect } from "react";
import { ProcessType } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const useProcessTypes = () => {
  const [processTypes, setProcessTypes] = useState<ProcessType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchProcessTypes = async () => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from("tipos_processo")
        .select("*")
        .eq("active", true)
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const typesData: ProcessType[] = data.map(type => ({
          id: type.id,
          name: type.name,
          description: type.description || "",
          active: type.active,
          createdAt: type.created_at
        }));
        
        setProcessTypes(typesData);
      }
    } catch (error) {
      console.error("Erro ao buscar tipos de processos:", error);
      toast.error("Erro ao carregar tipos de processos");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter o nome do tipo pelo ID
  const getProcessTypeName = (id: string): string => {
    const processType = processTypes.find(type => type.id === id);
    return processType ? processType.name : "Desconhecido";
  };

  useEffect(() => {
    fetchProcessTypes();
    
    // Inscrever-se para atualizações em tempo real
    const channel = supabase
      .channel('process-types-changes')
      .on(
        'postgres_changes',
        { 
          event: '*', 
          schema: 'public', 
          table: 'tipos_processo' 
        },
        () => {
          console.log('Mudança detectada na tabela de tipos de processo');
          fetchProcessTypes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    processTypes,
    isLoading,
    getProcessTypeName,
    fetchProcessTypes
  };
};
