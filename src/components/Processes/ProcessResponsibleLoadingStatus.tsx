
import React from "react";
import { useProcessBatchLoaderContext } from "@/contexts/ProcessBatchLoaderContext";
import { Loader2 } from "lucide-react";

/**
 * Componente para exibir o status de carregamento de responsáveis
 * Útil para debugging e monitoramento de performance
 */
const ProcessResponsibleLoadingStatus: React.FC = () => {
  const { 
    isLoading, 
    pendingProcessCount, 
    pendingSectorCount,
    batchSizes
  } = useProcessBatchLoaderContext();

  if (!isLoading && pendingProcessCount === 0 && pendingSectorCount === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-2 right-2 bg-white dark:bg-gray-800 shadow-md rounded-md p-2 text-xs border border-gray-200 dark:border-gray-700 z-10">
      <div className="flex items-center gap-2">
        {isLoading && <Loader2 className="h-3 w-3 animate-spin" />}
        <span>
          {isLoading ? "Carregando" : "Pendente"}:{" "}
          {pendingProcessCount > 0 && `${pendingProcessCount} proc.`}
          {pendingProcessCount > 0 && pendingSectorCount > 0 && ", "}
          {pendingSectorCount > 0 && `${pendingSectorCount} setor.`}
        </span>
        {(batchSizes.processes > 0 || batchSizes.sectors > 0) && (
          <span className="text-gray-500">
            Último lote: {batchSizes.processes + batchSizes.sectors}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProcessResponsibleLoadingStatus;
