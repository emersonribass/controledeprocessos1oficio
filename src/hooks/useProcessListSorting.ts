
import { useState } from "react";
import { Process } from "@/types";

export const useProcessListSorting = (initialSortField: keyof Process = "protocolNumber") => {
  const [sortField, setSortField] = useState<keyof Process>(initialSortField);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: keyof Process) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortProcesses = (processes: Process[]) => {
    return [...processes].sort((a, b) => {
      // Primeiramente, ordenar por estado do processo: 
      // 1. Em andamento (pendentes)
      // 2. Não iniciados 
      // 3. Concluídos
      if (a.status !== b.status) {
        // Se um for concluído e o outro não
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Se um for não iniciado e o outro estiver em andamento
        if (a.status === 'not_started' && (b.status === 'pending' || b.status === 'overdue')) return 1;
        if ((a.status === 'pending' || a.status === 'overdue') && b.status === 'not_started') return -1;
      }

      // Após ordenar por estado, ordenar por número de protocolo (dentro de cada grupo)
      if (sortField === "protocolNumber" || a.status !== b.status) {
        // Extrai números do protocolo para comparação numérica
        const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
        const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Se o campo de ordenação for data
      if (sortField === "startDate" || sortField === "expectedEndDate") {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Para outros campos
      if (a[sortField] < b[sortField]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      return 0;
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses
  };
};
