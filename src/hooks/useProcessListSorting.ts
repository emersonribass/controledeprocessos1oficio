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
    // Definir ordem explícita: Em andamento < Não iniciado < Concluído
    const getStatusOrder = (status: string) => {
      if (status === "Concluído") return 2;
      if (status === "Não iniciado") return 1;
      return 0; // Em andamento ou qualquer outro é tratado como iniciado
    };

    const statusA = getStatusOrder(a.status);
    const statusB = getStatusOrder(b.status);

    if (statusA !== statusB) return statusA - statusB;

    // Dentro do mesmo grupo, ordenar por número de protocolo crescente
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