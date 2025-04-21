
import { useState } from "react";
import { Process } from "@/types";

export const useProcessListSorting = () => {
  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const toggleSort = (field: keyof Process) => {
    if (sortField === field) {
      // Se o campo já está selecionado, inverte a direção
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Se é um novo campo, ordena ascendente por padrão
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const sortProcesses = (data: Process[]): Process[] => {
    return [...data].sort((a, b) => {
      // Certifique-se de que estamos acessando a propriedade correta
      const valueA = a[sortField];
      const valueB = b[sortField];
      
      if (sortField === "protocolNumber") {
        const numA = parseInt(String(valueA).replace(/\D/g, ''));
        const numB = parseInt(String(valueB).replace(/\D/g, ''));
        
        // Se ambos são números válidos, compare-os
        if (!isNaN(numA) && !isNaN(numB)) {
          return sortDirection === "asc" ? numA - numB : numB - numA;
        }
        
        // Se algum não é número válido, compare as strings
        return sortDirection === "asc" 
          ? String(valueA).localeCompare(String(valueB)) 
          : String(valueB).localeCompare(String(valueA));
      }
      
      // Para outros tipos de campos
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        return sortDirection === "asc" 
          ? valueA.localeCompare(valueB) 
          : valueB.localeCompare(valueA);
      }
      
      // Fallback para outros tipos de dados
      return sortDirection === "asc"
        ? (valueA > valueB ? 1 : -1)
        : (valueB > valueA ? 1 : -1);
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses,
  };
};
