
import { useDepartmentsFetch } from "./useDepartmentsFetch";
import { useDepartmentDialog } from "./useDepartmentDialog";
import { useDepartmentOperations } from "./useDepartmentOperations";
import { Department } from "@/types";
import { useReducer, useEffect } from "react";

// Definir tipos para o estado e ações
type DepartmentsState = {
  fetchedDepartments: Department[];
  optimisticDepartments: Department[] | null;
  isLoading: boolean;
  openDialog: boolean;
  openDeleteDialog: boolean;
  selectedDepartment: Department | null;
};

type DepartmentsAction =
  | { type: 'SET_FETCHED_DEPARTMENTS'; payload: Department[] }
  | { type: 'SET_OPTIMISTIC_DEPARTMENTS'; payload: Department[] | null }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'OPEN_DIALOG'; payload?: Department | null }
  | { type: 'CLOSE_DIALOG' }
  | { type: 'OPEN_DELETE_DIALOG'; payload: Department }
  | { type: 'CLOSE_DELETE_DIALOG' };

// Implementar o reducer
const departmentsReducer = (state: DepartmentsState, action: DepartmentsAction): DepartmentsState => {
  switch (action.type) {
    case 'SET_FETCHED_DEPARTMENTS':
      return { ...state, fetchedDepartments: action.payload };
    case 'SET_OPTIMISTIC_DEPARTMENTS':
      return { ...state, optimisticDepartments: action.payload };
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
    case 'OPEN_DIALOG':
      return { 
        ...state, 
        openDialog: true, 
        selectedDepartment: action.payload || null 
      };
    case 'CLOSE_DIALOG':
      return { ...state, openDialog: false };
    case 'OPEN_DELETE_DIALOG':
      return { 
        ...state, 
        openDeleteDialog: true, 
        selectedDepartment: action.payload 
      };
    case 'CLOSE_DELETE_DIALOG':
      return { ...state, openDeleteDialog: false };
    default:
      return state;
  }
};

export const useDepartments = () => {
  // Hooks separados com funcionalidades específicas
  const { departments: fetchedDepsFromAPI, isLoading, fetchDepartments } = useDepartmentsFetch();
  
  // Inicializar o estado com useReducer
  const [state, dispatch] = useReducer(departmentsReducer, {
    fetchedDepartments: [],
    optimisticDepartments: null,
    isLoading: true,
    openDialog: false,
    openDeleteDialog: false,
    selectedDepartment: null
  });
  
  // Sincronizar os departamentos buscados da API com o estado do reducer
  useEffect(() => {
    dispatch({ type: 'SET_FETCHED_DEPARTMENTS', payload: fetchedDepsFromAPI });
    dispatch({ type: 'SET_LOADING', payload: isLoading });
  }, [fetchedDepsFromAPI, isLoading]);
  
  // Use os departamentos otimistas se disponíveis, caso contrário, use os buscados do servidor
  const departments = state.optimisticDepartments || state.fetchedDepartments;
  
  // Atualizações otimistas para operações
  const handleOptimisticUpdate = (updatedDepartments: Department[]) => {
    dispatch({ type: 'SET_OPTIMISTIC_DEPARTMENTS', payload: updatedDepartments });
  };
  
  const { handleMoveUp, handleMoveDown, confirmDelete } = useDepartmentOperations(
    fetchDepartments, 
    handleOptimisticUpdate
  );

  // Handlers para as ações
  const handleAddDepartment = () => {
    dispatch({ type: 'OPEN_DIALOG' });
  };

  const handleEditDepartment = (department: Department) => {
    dispatch({ type: 'OPEN_DIALOG', payload: department });
  };

  const handleDeleteDepartment = (department: Department) => {
    dispatch({ type: 'OPEN_DELETE_DIALOG', payload: department });
  };

  // Função para confirmar exclusão que usa o estado do reducer
  const handleConfirmDelete = async () => {
    const result = await confirmDelete(state.selectedDepartment);
    if (result) {
      dispatch({ type: 'CLOSE_DELETE_DIALOG' });
      // Após exclusão, voltamos a usar os departamentos do servidor
      dispatch({ type: 'SET_OPTIMISTIC_DEPARTMENTS', payload: null });
    }
  };

  // Função para quando um departamento é salvo
  const onDepartmentSaved = () => {
    dispatch({ type: 'CLOSE_DIALOG' });
    // Após salvar, voltamos a usar os departamentos do servidor
    dispatch({ type: 'SET_OPTIMISTIC_DEPARTMENTS', payload: null });
  };

  // Retornar todas as funcionalidades combinadas mantendo a API original
  return {
    departments,
    isLoading: state.isLoading,
    openDialog: state.openDialog,
    setOpenDialog: (open: boolean) => dispatch({ type: open ? 'OPEN_DIALOG' : 'CLOSE_DIALOG' }),
    openDeleteDialog: state.openDeleteDialog,
    setOpenDeleteDialog: (open: boolean) => {
      if (!open) dispatch({ type: 'CLOSE_DELETE_DIALOG' });
      // Nota: O caso para abrir já é tratado por handleDeleteDepartment
    },
    selectedDepartment: state.selectedDepartment,
    handleAddDepartment,
    handleEditDepartment,
    handleDeleteDepartment,
    handleMoveUp,
    handleMoveDown,
    confirmDelete: handleConfirmDelete,
    onDepartmentSaved
  };
};
