
import { Process, Department } from "@/types";

/**
 * Hook otimizado para formatar processos
 */
export const useProcessFormatter = () => {
  const formatProcesses = (processesData: any[]): Process[] => {
    return processesData.map(process => {
      // Mapear status para o formato usado no frontend
      let status: 'pending' | 'completed' | 'not_started' | 'archived' = 'pending';
      switch (process.status) {
        case 'Em andamento':
          status = 'pending';
          break;
        case 'Concluído':
          status = 'completed';
          break;
        case 'Não iniciado':
          status = 'not_started';
          break;
        case 'Arquivado':
          status = 'archived';
          break;
      }

      // Formatar o histórico para o formato usado no frontend
      const formattedHistory = process.processos_historico.map((h: any) => ({
        id: h.id.toString(),
        departmentId: h.setor_id,
        entryDate: h.data_entrada,
        exitDate: h.data_saida,
        userId: h.usuario_id
      }));

      // Garantir que a propriedade responsibles existe e é consistente
      const responsibles = process.responsibles || {};

      // Construir o objeto de processo no formato esperado pelo frontend
      return {
        id: process.id,
        protocolNumber: process.numero_protocolo,
        createdAt: process.created_at,
        updatedAt: process.updated_at,
        startDate: process.data_inicio,
        expectedEndDate: process.data_fim_esperada,
        status: status,
        currentDepartment: process.setor_atual,
        userId: process.usuario_responsavel, // Criador do processo
        processType: process.tipo_processo,
        history: formattedHistory,
        responsibleUserId: process.usuario_responsavel, // Responsável atual pelo processo
        responsibles: responsibles
      };
    });
  };

  return { formatProcesses };
};
