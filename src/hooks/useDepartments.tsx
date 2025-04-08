
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Department } from "@/types";

export const useDepartments = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchDepartments();
  }, []);

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('setores')
        .select('*')
        .order('order_num', { ascending: true });

      if (error) {
        throw error;
      }

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar os setores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddDepartment = () => {
    setSelectedDepartment(null);
    setOpenDialog(true);
  };

  const handleEditDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDialog(true);
  };

  const handleDeleteDepartment = (department: Department) => {
    setSelectedDepartment(department);
    setOpenDeleteDialog(true);
  };

  // Nova função para mover um departamento para cima na ordem
  const handleMoveUp = async (department: Department) => {
    const currentIndex = departments.findIndex(d => d.id === department.id);
    if (currentIndex <= 0) return; // Já está no topo

    const prevDepartment = departments[currentIndex - 1];
    
    try {
      // Atualizar a ordem no banco de dados
      const batch = [];
      
      // Atualizar o departamento atual para a ordem anterior
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: prevDepartment.order })
          .eq('id', Number(department.id))
      );
      
      // Atualizar o departamento anterior para a ordem atual
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: department.order })
          .eq('id', Number(prevDepartment.id))
      );
      
      await Promise.all(batch);
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      fetchDepartments();
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os setores.",
        variant: "destructive"
      });
    }
  };

  // Nova função para mover um departamento para baixo na ordem
  const handleMoveDown = async (department: Department) => {
    const currentIndex = departments.findIndex(d => d.id === department.id);
    if (currentIndex >= departments.length - 1) return; // Já está no fim
    
    const nextDepartment = departments[currentIndex + 1];
    
    try {
      // Atualizar a ordem no banco de dados
      const batch = [];
      
      // Atualizar o departamento atual para a ordem seguinte
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: nextDepartment.order })
          .eq('id', Number(department.id))
      );
      
      // Atualizar o departamento seguinte para a ordem atual
      batch.push(
        supabase
          .from('setores')
          .update({ order_num: department.order })
          .eq('id', Number(nextDepartment.id))
      );
      
      await Promise.all(batch);
      
      toast({
        title: "Sucesso",
        description: "Ordem dos setores atualizada."
      });
      
      // Atualizar a lista local
      fetchDepartments();
    } catch (error) {
      console.error('Erro ao reordenar setores:', error);
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os setores.",
        variant: "destructive"
      });
    }
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

      toast({
        title: "Sucesso",
        description: `Setor "${selectedDepartment.name}" removido com sucesso.`
      });

      fetchDepartments();
    } catch (error) {
      console.error('Erro ao excluir setor:', error);
      toast({
        title: "Erro",
        description: "Não foi possível remover o setor.",
        variant: "destructive"
      });
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const onDepartmentSaved = () => {
    fetchDepartments();
    setOpenDialog(false);
  };

  return {
    departments,
    isLoading,
    openDialog,
    setOpenDialog,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleMoveUp,
    handleMoveDown,
    confirmDelete,
    onDepartmentSaved
  };
};
