
import { useState } from "react";
import { Process } from "@/types";

export const useProcessListSorting = () => {
  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: keyof Process) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortProcesses = (data: Process[]): Process[] => {
    return [...data].sort((a, b) => {
      // 1. Ordenar por status primeiro
      const statusPriority = {
        'pending': 1,    // Em andamento
        'overdue': 1,    // Em andamento (atrasado)
        'completed': 2,  // Concluído
        'not_started': 3 // Não iniciado
      };

      const statusA = statusPriority[a.status] || 0;
      const statusB = statusPriority[b.status] || 0;

      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // 2. Ordenar por número de protocolo (sempre crescente)
      const protocolA = a.protocolNumber || "";
      const protocolB = b.protocolNumber || "";
      
      // Remover caracteres não numéricos e converter para número
      const numA = parseInt(protocolA.replace(/\D/g, ''));
      const numB = parseInt(protocolB.replace(/\D/g, ''));
      
      return numA - numB;
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses,
  };
};
