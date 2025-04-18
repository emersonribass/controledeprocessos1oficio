
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
      // 1. Ordenar por status primeiro - corrigido para priorizar processos em andamento
      const statusPriority = {
        'pending': 0,     // Em andamento (prioridade máxima)
        'overdue': 1,     // Em andamento (atrasado)
        'completed': 2,   // Concluído
        'not_started': 3  // Não iniciado (menor prioridade, independente da data de início)
      };

      const statusA = statusPriority[a.status] || 0;
      const statusB = statusPriority[b.status] || 0;

      // Se os status são diferentes, ordenar por prioridade de status
      if (statusA !== statusB) {
        return statusA - statusB;
      }

      // 2. Ordenar por número de protocolo
      const protocolA = a.protocolNumber || "";
      const protocolB = b.protocolNumber || "";

      // Função auxiliar para extrair e comparar números de protocolo
      const compareProtocolNumbers = (a: string, b: string) => {
        // Remover todos os caracteres não numéricos e converter para número
        const numA = parseInt(a.replace(/\D/g, ''));
        const numB = parseInt(b.replace(/\D/g, ''));
        
        // Se ambos são números válidos, compare-os
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }
        
        // Se algum não é número válido, compare as strings
        return sortDirection === "asc" 
          ? protocolA.localeCompare(protocolB) 
          : protocolB.localeCompare(protocolA);
      };

      return compareProtocolNumbers(protocolA, protocolB);
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses,
  };
};
