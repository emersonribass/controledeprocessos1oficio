
import React, { createContext, useContext, ReactNode } from "react";
import { useProcessBatchLoader } from "@/hooks/useProcessBatchLoader";
import { ProcessResponsible } from "@/hooks/process-responsibility/types";

// Definindo o tipo do contexto
interface ProcessBatchLoaderContextType {
  isLoading: boolean;
  processResponsibles: Record<string, ProcessResponsible | null>;
  sectorResponsibles: Record<string, ProcessResponsible | null>;
  getProcessResponsible: (processId: string) => ProcessResponsible | null | undefined;
  getSectorResponsible: (processId: string, sectorId: string) => ProcessResponsible | null | undefined;
  queueProcessForLoading: (processId: string) => void;
  queueSectorForLoading: (processId: string, sectorId: string) => void;
  processBatch: () => Promise<void>;
}

// Criando o contexto
const ProcessBatchLoaderContext = createContext<ProcessBatchLoaderContextType | undefined>(undefined);

// Provider component
export const ProcessBatchLoaderProvider = ({ children }: { children: ReactNode }) => {
  const batchLoader = useProcessBatchLoader();

  return (
    <ProcessBatchLoaderContext.Provider value={batchLoader}>
      {children}
    </ProcessBatchLoaderContext.Provider>
  );
};

// Hook para usar o contexto
export const useProcessBatchLoaderContext = (): ProcessBatchLoaderContextType => {
  const context = useContext(ProcessBatchLoaderContext);
  if (context === undefined) {
    throw new Error("useProcessBatchLoaderContext deve ser usado dentro de um ProcessBatchLoaderProvider");
  }
  return context;
};
