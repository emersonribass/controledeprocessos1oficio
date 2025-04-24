
import { useState, useCallback } from "react";
import { Process } from "@/types";

export const useProcessListSorting = () => {
  const [sortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection] = useState<"asc" | "desc">("asc");

  const sortProcesses = useCallback((data: Process[]): Process[] => {
    return [...data].sort((a, b) => {
      const numA = parseInt(a.protocolNumber.replace(/\D/g, ''));
      const numB = parseInt(b.protocolNumber.replace(/\D/g, ''));
      
      // Se ambos são números válidos, compare-os
      if (!isNaN(numA) && !isNaN(numB)) {
        return numA - numB;
      }
      
      // Se algum não é número válido, compare as strings
      return a.protocolNumber.localeCompare(b.protocolNumber);
    });
  }, []);

  return {
    sortField,
    sortDirection,
    sortProcesses,
    toggleSort: () => {}, // Mantido para compatibilidade da interface
  };
};
