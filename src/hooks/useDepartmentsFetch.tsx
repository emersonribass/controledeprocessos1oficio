
import { useState, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";

export const useDepartmentsFetch = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os setores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  return {
    departments,
    isLoading,
    fetchDepartments
  };
};
