
import { useState, useEffect } from "react";
import { supabase, adminSupabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Department } from "@/types";
import { useAuth } from "@/hooks/useAuth";

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openSheet, setOpenSheet] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    if (user) {
      fetchDepartments();
    }
  }, [user]);

  const fetchDepartments = async () => {
    console.log("Buscando setores...");
    setIsLoading(true);
    try {
      // Use o cliente apropriado baseado no perfil do usuário
      const client = user && isAdmin(user.email) ? adminSupabase : supabase;
      console.log("Cliente Supabase para buscar setores:", isAdmin(user?.email) ? "Admin" : "Regular");
      
      const { data, error } = await client
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
      // Use o cliente apropriado baseado no perfil do usuário
      const client = user && isAdmin(user.email) ? adminSupabase : supabase;
      
      const { error } = await client
        .from('setores')
        .delete()
        .eq('id', Number(selectedDepartment.id));

      if (error) {
        throw error;
      }

      toast.success(`Setor "${selectedDepartment.name}" removido com sucesso.`);
      fetchDepartments();
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
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
