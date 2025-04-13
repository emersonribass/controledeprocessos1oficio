
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
      // Primeiro, ordenar por status: processos iniciados (não 'not_started') vêm primeiro
      if (a.status === 'not_started' && b.status !== 'not_started') {
        return 1; // a (não iniciado) vem depois
      }
      if (a.status !== 'not_started' && b.status === 'not_started') {
        return -1; // a (iniciado) vem antes
      }
      
      // Se ambos têm o mesmo status de iniciação, usar a ordenação por campo selecionado
      /*if (sortField === "startDate" || sortField === "expectedEndDate") {
        const dateA = new Date(a[sortField]).getTime();
        const dateB = new Date(b[sortField]).getTime();
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }*/

      if (sortField === "protocolNumber") {
        const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
        const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }

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
