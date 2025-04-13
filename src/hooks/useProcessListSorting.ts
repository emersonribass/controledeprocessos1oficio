import { useState } from "react";
import { Process } from "@/types/process";

// Tipos para controle do campo e direção de ordenação
export const useProcessListSorting = () => {
  const [sortField, setSortField] = useState<keyof Process>("protocolNumber");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Alterna entre crescente e decrescente para o campo atual
  const toggleSort = (field: keyof Process) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Função que aplica a ordenação aos processos
  const sortProcesses = (data: Process[]): Process[] => {
  return [...data].sort((a, b) => {
    // 1. Definir a ordem: Em andamento e atrasado → 0, Não iniciado → 1, Concluído → 2
    const getStatusOrder = (status: string) => {
      switch (status) {
        case "pending":
        case "overdue":
          return 0; // Prioridade mais alta → aparece primeiro
        case "not_started":
          return 1; // Depois dos iniciados
        case "completed":
          return 2; // Sempre por último
      }
    };

    const statusA = getStatusOrder(a.status);
    const statusB = getStatusOrder(b.status);

    if (statusA !== statusB) return statusA - statusB;

    // 2. Dentro do mesmo grupo, ordenar por número de protocolo crescente
    const protocolA = a.protocolNumber || "";
    const protocolB = b.protocolNumber || "";

    return protocolA.localeCompare(protocolB, "pt-BR", { numeric: true });
  });
};

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses,
  };
};