
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
      // Primeiro, ordenar por estado do processo: 
      // 1. Em andamento (pendentes/overdue)
      // 2. Não iniciados
      // 3. Concluídos
      if (a.status !== b.status) {
        // Se um processo for concluído e outro não
        if (a.status === 'completed' && b.status !== 'completed') return 1;
        if (a.status !== 'completed' && b.status === 'completed') return -1;
        
        // Se um processo for não iniciado e outro estiver em andamento
        if (a.status === 'not_started' && (b.status === 'pending' || b.status === 'overdue')) return 1;
        if ((a.status === 'pending' || a.status === 'overdue') && b.status === 'not_started') return -1;
      }

      // Após ordenar por estado, ordenar por número de protocolo dentro de cada grupo
      // Sempre do menor para o maior, independente da direção de ordenação selecionada
      // para manter consistência em todas as páginas
      const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
      const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
      
      // Se estivermos ordenando pelo campo protocolNumber, aplicar a direção de ordenação selecionada
      if (sortField === "protocolNumber") {
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Para ordenação padrão dentro dos grupos, sempre usar crescente
      if (sortField !== "startDate" && sortField !== "expectedEndDate") {
        return numA - numB;
      }
      
      // Para os campos de data, garantir que estamos trabalhando com strings de data
      if (sortField === "startDate" || sortField === "expectedEndDate") {
        // Verificar e garantir que os valores são strings antes de criar objetos Date
        const dateValueA = typeof a[sortField] === 'string' ? a[sortField] as string : '';
        const dateValueB = typeof b[sortField] === 'string' ? b[sortField] as string : '';
        
        const dateA = dateValueA ? new Date(dateValueA).getTime() : 0;
        const dateB = dateValueB ? new Date(dateValueB).getTime() : 0;
        
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Para outros campos
      if (a[sortField] < b[sortField]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      
      // Se tudo for igual, manter ordenação de protocolo
      return numA - numB;
    });
  };

  return {
    sortField,
    sortDirection,
    toggleSort,
    sortProcesses
  };
};
