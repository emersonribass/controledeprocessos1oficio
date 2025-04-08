
import { useDepartmentsFetch } from "@/hooks/useDepartmentsFetch";
import { useDepartmentDialog } from "@/hooks/useDepartmentDialog";
import { useDepartmentOperations } from "@/hooks/useDepartmentOperations";

export const useDepartments = () => {
  // Hooks separados com funcionalidades específicas
  const { departments, isLoading, fetchDepartments } = useDepartmentsFetch();
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
  const { handleMoveUp, handleMoveDown, confirmDelete } = useDepartmentOperations(fetchDepartments);

  // Função para confirmar exclusão que usa o estado do hook de diálogo
  const handleConfirmDelete = async () => {
    const result = await confirmDelete(selectedDepartment);
    if (result) {
      setOpenDeleteDialog(false);
    }
  };

  // Função para quando um departamento é salvo
  const onDepartmentSaved = () => {
    fetchDepartments();
    setOpenDialog(false);
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
