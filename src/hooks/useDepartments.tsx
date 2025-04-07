
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";  // Importando corretamente o toast da biblioteca sonner
import { Department } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSheet, setOpenSheet] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    console.log("Buscando setores...");
    setIsLoading(true);
    try {
      // Removendo RLS usando a opção de configuração
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        console.error("Erro ao buscar setores:", error);
        throw error;
      }

      console.log("Setores carregados:", data);

      // Converter os dados do Supabase para o formato do nosso tipo Department
      const formattedDepartments: Department[] = data.map(dept => ({
        id: dept.id.toString(),
        name: dept.name,
        order: dept.order_num,
        timeLimit: dept.time_limit
      }));

      setDepartments(formattedDepartments);
    } catch (error) {
      console.error('Erro ao buscar setores:', error);
      // Corrigindo a chamada do toast para utilizar a biblioteca sonner
      toast.error("Não foi possível carregar os setores.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setOpenSheet(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setOpenSheet(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!selectedDepartment) return;

    try {
      const { error } = await supabase
        .from('setores')
        .delete()
        .eq('id', Number(selectedDepartment.id));

      if (error) {
        throw error;
      }

      // Corrigindo a chamada do toast para utilizar a biblioteca sonner
      toast.success(`Setor "${selectedDepartment.name}" removido com sucesso.`);

      fetchDepartments();
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      // Corrigindo a chamada do toast para utilizar a biblioteca sonner
      toast.error("Não foi possível remover o setor.");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const onDepartmentSaved = () => {
    fetchDepartments();
    setOpenSheet(false);
  };

  return {
    departments,
    isLoading,
    openSheet,
    setOpenSheet,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    confirmDelete,
    onDepartmentSaved
  };
};
