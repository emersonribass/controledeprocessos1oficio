
import { Process } from "@/types";

export const useProcessFormatter = () => {
  const formatProcesses = (processesData: any[]): Process[] => {
    return processesData ? processesData.map(process => {
      // Verificar se está atrasado
      const expectedEndDate = new Date(process.data_fim_esperada);
      const now = new Date();
      let status: 'pending' | 'completed' | 'overdue';
      
      if (process.status === 'Concluído') {
        status = 'completed';
      } else if (now > expectedEndDate) {
        status = 'overdue';
      } else {
        status = 'pending';
      }

      // Formatar o histórico
      const history = process.processos_historico ? process.processos_historico.map((h: any) => ({
        departmentId: h.setor_id,
        entryDate: h.data_entrada,
        exitDate: h.data_saida,
        userId: h.usuario_id || "1"
      })) : [];

      return {
        id: process.id,
        protocolNumber: process.numero_protocolo,
        processType: process.tipo_processo,
        currentDepartment: process.setor_atual,
        startDate: process.data_inicio,
        expectedEndDate: process.data_fim_esperada,
        status,
        history
      };
    }) : [];
  };

  return { formatProcesses };
};
