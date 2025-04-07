
import { useState, useEffect } from "react";
import { Department } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export const useDepartmentsData = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    console.log("useDepartmentData: Buscando setores...");
    try {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        console.error("useDepartmentData: Erro ao buscar setores:", error);
        throw error;
      }

      console.log("useDepartmentData: Setores carregados:", data);

      const formattedDepartments: Department[] = data.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        order: dept.order_num,
        timeLimit: dept.time_limit
      }));

      setDepartments(formattedDepartments);
    } catch (error) {
      console.error('useDepartmentData: Erro ao buscar setores:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  return {
    departments,
    isLoading,
    getDepartmentName,
    fetchDepartments
  };
};
