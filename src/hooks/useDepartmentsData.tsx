
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Department } from "@/types";
import { toast } from "sonner";

export const useDepartmentsData = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDepartments = async () => {
    try {
      const { data, error } = await supabase
        .from("setores")
        .select("*")
        .order("order_num", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const formattedDepartments: Department[] = data.map((dept) => ({
          id: dept.id.toString(),
          name: dept.name,
          order: dept.order_num,
          timeLimit: dept.time_limit,
        }));
        
        setDepartments(formattedDepartments);
      }
    } catch (error) {
      console.error("Erro ao buscar departamentos:", error);
      toast.error("Não foi possível carregar os setores.");
    } finally {
      setIsLoading(false);
    }
  };

  // Função para obter o nome do departamento pelo ID
  const getDepartmentName = (id: string): string => {
    const department = departments.find((dept) => dept.id === id);
    return department ? department.name : "Desconhecido";
  };

  useEffect(() => {
    fetchDepartments();

    // Inscrever-se para atualizações em tempo real da tabela setores
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'setores'
        },
        () => {
          console.log('Mudança detectada na tabela setores - atualizando dados');
          fetchDepartments();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    departments,
    isLoading,
    getDepartmentName,
    fetchDepartments
  };
};
