
// Exportar componentes
export * from './components/ProcessTable';
export * from './components/ProcessTableBody';
export * from './components/ProcessTableHeader';
export * from './components/ProcessTypePicker';
export * from './components/ProcessDepartmentCell';
export * from './components/ProcessDetails';

// Exportar provider e contexto
export * from './context/ProcessesContext';

// Exportar hooks
export * from './hooks/useProcesses';
export * from './hooks/useProcessesFetch';
export * from './hooks/useProcessFilters';
export * from './hooks/useProcessFormatter';
export * from './hooks/useProcessMovement';
export * from './hooks/useProcessTypes';
export * from './hooks/useProcessUpdate';
export * from './hooks/useSupabaseProcesses';
export * from './hooks/useProcessDelete';
export * from './hooks/useProcessStart';

// Exportar hook useProcessResponsibles de forma independente para evitar ambiguidade
import { useProcessResponsibles } from './hooks/useProcessResponsibles';
export { useProcessResponsibles };

// Exportar tipos
export * from './types';
