
import { useState } from "react";
import { Process } from "@/types";

export const useProcessTableState = () => {
  const [loadingSector, setLoadingSector] = useState<{processId: string, sectorId: string} | null>(null);
  
  const queueSectorForLoading = (processId: string, sectorId: string) => {
    setLoadingSector({ processId, sectorId });
    // Atualizará automaticamente quando o responsável mudar
    setTimeout(() => setLoadingSector(null), 2000);
  };

  return {
    loadingSector,
    queueSectorForLoading
  };
};
