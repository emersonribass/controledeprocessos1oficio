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
      // Definimos uma ordem de prioridade:
      // 0 = iniciado, 1 = não iniciado, 2 = concluído
      const getStatusOrder = (process: Process) => {
        if (process.status === "completed") return 2;
        if (process.status === "not_started" || !process.startedAt) return 1; // se não tiver data de início, ainda não começou
        return 0;
      };

      // Compara os status
      const statusA = getStatusOrder(a);
      const statusB = getStatusOrder(b);

      // Se forem diferentes, aplica a ordem definida
      if (statusA !== statusB) return statusA - statusB;

      // Caso estejam no mesmo grupo, ordena pelo número de protocolo (sempre crescente)
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