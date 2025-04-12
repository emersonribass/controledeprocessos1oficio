
import { useState, useEffect } from "react";
import { Department } from "@/types";
import { supabase } from "@/integrations/supabase/client";

export const useDepartmentsData = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const { data, error } = await supabase
          .from('setores')
          .select('*')
          .order('order_num', { ascending: true });

        if (error) {
          throw error;
        }

        const formattedDepartments: Department[] = data.map(dept => ({
          id: dept.id.toString(),
          name: dept.name,
          order: dept.order_num,
          timeLimit: dept.time_limit
        }));

        setDepartments(formattedDepartments);
      } catch (error) {
        console.error('Erro ao buscar setores:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDepartments();
  }, []);

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  return {
    departments,
    isLoading,
    getDepartmentName,
  };
};
