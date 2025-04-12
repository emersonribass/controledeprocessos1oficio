
import { useDepartmentsFetch } from "./useDepartmentsFetch";
import { useDepartmentDialog } from "./useDepartmentDialog";
import { useDepartmentOperations } from "./useDepartmentOperations";
import { Department } from "@/types";
import { useState } from "react";

export const useDepartments = () => {
  // Estado local para atualizações otimistas
  const { departments: fetchedDepartments, isLoading, fetchDepartments } = useDepartmentsFetch();
  const [optimisticDepartments, setOptimisticDepartments] = useState<Department[] | null>(null);
  
  // Use os departamentos otimistas se disponíveis, caso contrário, use os buscados do servidor
  const departments = optimisticDepartments || fetchedDepartments;
  
  // Hooks separados com funcionalidades específicas
  const { 
    openDialog, 
    setOpenDialog, 
    openDeleteDialog, 
    setOpenDeleteDialog, 
    selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment
  } = useDepartmentDialog();
  
  // Atualizações otimistas para operações
  const handleOptimisticUpdate = (updatedDepartments: Department[]) => {
    setOptimisticDepartments(updatedDepartments);
  };
  
  const { handleMoveUp, handleMoveDown, confirmDelete } = useDepartmentOperations(
    fetchDepartments, 
    handleOptimisticUpdate
  );

  // Função para confirmar exclusão que usa o estado do hook de diálogo
  const handleConfirmDelete = async () => {
    const result = await confirmDelete(selectedDepartment);
    if (result) {
      setOpenDeleteDialog(false);
      // Após exclusão, voltamos a usar os departamentos do servidor
      setOptimisticDepartments(null);
    }
  };

  // Função para quando um departamento é salvo
  const onDepartmentSaved = () => {
    // Não precisamos mais chamar fetchDepartments aqui
    // pois o evento real-time cuidará disso
    setOpenDialog(false);
    // Após salvar, voltamos a usar os departamentos do servidor
    setOptimisticDepartments(null);
  };

  // Retornar todas as funcionalidades combinadas mantendo a API original
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
    confirmDelete: handleConfirmDelete,
    onDepartmentSaved
  };
};
