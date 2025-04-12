
// Este arquivo exporta todos os hooks e componentes disponíveis no módulo processes

// Hooks
export * from "./hooks/useProcesses";
export * from "./hooks/useProcessesFetch";
export * from "./hooks/useProcessFilters";
export * from "./hooks/useProcessTypes";
export * from "./hooks/useProcessUpdate";
export * from "./hooks/useProcessMovement";
export * from "./hooks/useProcessDelete";
export * from "./hooks/useProcessStart";

// Hooks de responsáveis
// Removido a exportação direta de useProcessResponsibles para evitar duplicação
// Agora exportamos apenas através do namespace 'responsible'
export * from "./hooks/responsible";

// Context
export * from "./context/ProcessesContext";
