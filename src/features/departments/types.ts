
import { Department } from "@/types";

export interface DepartmentsContextType {
  departments: Department[];
  isLoading: boolean;
  openDialog: boolean;
  setOpenDialog: React.Dispatch<React.SetStateAction<boolean>>;
  openDeleteDialog: boolean;
  setOpenDeleteDialog: React.Dispatch<React.SetStateAction<boolean>>;
  selectedDepartment: Department | null;
  handleAddDepartment: () => void;
  handleEditDepartment: (department: Department) => void;
  handleDeleteDepartment: (department: Department) => void;
  handleMoveUp: (department: Department) => Promise<void>;
  handleMoveDown: (department: Department) => Promise<void>;
  confirmDelete: () => Promise<boolean>;
  onDepartmentSaved: () => void;
}
