
import { Department } from "@/types";
import { useDeleteOperation } from "./operations/useDeleteOperation";
import { useMoveUpOperation } from "./operations/useMoveUpOperation";
import { useMoveDownOperation } from "./operations/useMoveDownOperation";

export const useDepartmentOperations = (
  fetchDepartments: () => Promise<void>,
  onOptimisticUpdate?: (departments: Department[]) => void
) => {
  // Importar as funcionalidades específicas de cada hook
  const { handleMoveUp: moveUp } = useMoveUpOperation();
  const { handleMoveDown: moveDown } = useMoveDownOperation();
  const { confirmDelete } = useDeleteOperation();
  
  // Envelopar as funções para incluir a atualização otimista
  const handleMoveUp = async (department: Department) => {
    await moveUp(department, onOptimisticUpdate);
  };
  
  const handleMoveDown = async (department: Department) => {
    await moveDown(department, onOptimisticUpdate);
  };
  
  // Retornar todas as funcionalidades mantendo a API original
  return {
    handleMoveUp,
    handleMoveDown,
    confirmDelete
  };
};
