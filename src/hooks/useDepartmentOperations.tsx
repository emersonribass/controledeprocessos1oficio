
import { useMoveUpOperation } from "./department-operations/useMoveUpOperation";
import { useMoveDownOperation } from "./department-operations/useMoveDownOperation";
import { useDeleteOperation } from "./department-operations/useDeleteOperation";

export const useDepartmentOperations = (fetchDepartments: () => Promise<void>) => {
  // Importar as funcionalidades específicas de cada hook
  const { handleMoveUp } = useMoveUpOperation();
  const { handleMoveDown } = useMoveDownOperation();
  const { confirmDelete } = useDeleteOperation();
  
  // Retornar todas as funcionalidades mantendo a API original
  return {
    handleMoveUp,
    handleMoveDown,
    confirmDelete
  };
};
