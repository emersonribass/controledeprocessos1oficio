
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
      // PRIORIDADE DE ORDENAÇÃO:
      // 1. Por status (Em andamento, Não iniciados, Concluídos)
      // 2. Dentro do status "Em andamento", ordenar por data de início (mais recente primeiro)
      // 3. Por número de protocolo dentro de cada grupo
      
      // Passo 1: Verificar e ordenar por status do processo
      if (a.status !== b.status) {
        // Processos concluídos sempre ficam por último
        if (a.status === 'completed') return 1;
        if (b.status === 'completed') return -1;
        
        // Processos em andamento (pending/overdue) têm prioridade sobre não iniciados
        if (a.status === 'not_started' && (b.status === 'pending' || b.status === 'overdue')) return 1;
        if ((a.status === 'pending' || a.status === 'overdue') && b.status === 'not_started') return -1;
      }
      
      // Passo 2: Para processos com mesmo status "pending", ordenar por data (mais recente primeiro)
      if (a.status === 'pending' && b.status === 'pending') {
        // Se não estivermos ordenando explicitamente por outro campo
        if (sortField !== "protocolNumber" && sortField !== "startDate" && sortField !== "expectedEndDate") {
          // Garantir que estamos trabalhando com strings de data válidas
          const aStartDate = typeof a.startDate === 'string' ? a.startDate : '';
          const bStartDate = typeof b.startDate === 'string' ? b.startDate : '';
          
          if (aStartDate && bStartDate) {
            const dateA = new Date(aStartDate).getTime();
            const dateB = new Date(bStartDate).getTime();
            // Ordenar do mais recente para o mais antigo
            return dateB - dateA;
          }
        }
      }

      // Passo 3: Ordenação explícita pelo campo selecionado pelo usuário
      // Se estivermos ordenando pelo protocolo
      if (sortField === "protocolNumber") {
        const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
        const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
        return sortDirection === "asc" ? numA - numB : numB - numA;
      }
      
      // Se estivermos ordenando por campos de data
      if (sortField === "startDate" || sortField === "expectedEndDate") {
        // Garantir que estamos lidando com strings válidas
        const fieldA = typeof a[sortField] === 'string' ? a[sortField] as string : '';
        const fieldB = typeof b[sortField] === 'string' ? b[sortField] as string : '';
        
        // Converter para timestamps para comparação
        const dateA = fieldA ? new Date(fieldA).getTime() : 0;
        const dateB = fieldB ? new Date(fieldB).getTime() : 0;
        
        return sortDirection === "asc" ? dateA - dateB : dateB - dateA;
      }

      // Para outros campos, aplicar a ordenação padrão
      if (a[sortField] < b[sortField]) {
        return sortDirection === "asc" ? -1 : 1;
      }
      if (a[sortField] > b[sortField]) {
        return sortDirection === "asc" ? 1 : -1;
      }
      
      // Se os campos de ordenação forem iguais, manter ordenação pelo número de protocolo
      const numA = parseInt(a.protocolNumber.replace(/\D/g, ""));
      const numB = parseInt(b.protocolNumber.replace(/\D/g, ""));
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
