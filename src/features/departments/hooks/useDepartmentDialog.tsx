
import { useState } from "react";
import { Department } from "@/types";

export const useDepartmentDialog = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);

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

  return {
    openDialog,
    setOpenDialog,
    openDeleteDialog,
    setOpenDeleteDialog,
    selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment
  };
};
