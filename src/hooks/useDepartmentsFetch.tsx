
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";
import { toast } from "sonner";

export const useDepartmentsFetch = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const hasFetchedRef = useRef(false);

  const fetchDepartments = async (forceRefresh = false) => {
    // Evitar consulta repetida se já tivermos os departamentos e não for forçada uma atualização
    if (hasFetchedRef.current && departments.length > 0 && !forceRefresh) {
      console.log("Usando departamentos em cache, evitando consulta desnecessária.");
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      console.log("Buscando setores do banco de dados...");
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        console.error("Erro na consulta do Supabase:", error);
        throw error;
      }

      if (!data) {
        console.log("Nenhum dado retornado");
        setDepartments([]);
        return;
      }

      // Converter os dados do Supabase para o formato do nosso tipo Department
      const formattedDepartments: Department[] = data.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        order: dept.order_num,
        timeLimit: dept.time_limit
      }));

      console.log('Setores atualizados:', formattedDepartments);
      setDepartments(formattedDepartments);
      hasFetchedRef.current = true;
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      toast.error("Não foi possível carregar os setores.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
    
    // Inscrever-se para atualizações em tempo real da tabela setores
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*', // Escutar todos os eventos (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'setores'
        },
        (payload) => {
          console.log('Mudança detectada na tabela setores:', payload);
          fetchDepartments(true); // Forçar atualização ao receber uma mudança
        }
      )
      .subscribe();

    // Cleanup da inscrição ao desmontar o componente
    return () => {
      console.log('Removendo canal de escuta para tabela setores');
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    departments,
    isLoading,
    fetchDepartments
  };
};
