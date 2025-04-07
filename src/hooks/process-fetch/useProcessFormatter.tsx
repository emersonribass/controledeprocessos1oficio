
import { Process } from "@/types";

export const useProcessFormatter = () => {
  const formatProcesses = (processesData: any[]): Process[] => {
    return processesData ? processesData.map(process => {
      // Verificar status do processo primeiro
      let status: 'pending' | 'completed' | 'overdue' | 'not_started';
      
      // Primeiro verificar se é "Não iniciado"
      if (process.status === 'Não iniciado') {
        status = 'not_started';
        // Retornamos imediatamente o processo com status not_started sem verificar prazos
        return {
          id: process.id,
          protocolNumber: process.numero_protocolo,
          processType: process.tipo_processo,
          currentDepartment: process.setor_atual,
          startDate: process.data_inicio,
          expectedEndDate: process.data_fim_esperada,
          status,
          history: process.processos_historico ? process.processos_historico.map((h: any) => ({
            departmentId: h.setor_id,
            entryDate: h.data_entrada,
            exitDate: h.data_saida,
            userId: h.usuario_id || ""
          })) : [],
          userId: process.usuario_id,
          responsibleUserId: process.usuario_responsavel,
          isDepartmentOverdue: false
        };
      }
      
      // Se não for "Não iniciado", verificar outros status
      if (process.status === 'Concluído') {
        status = 'completed';
      } else {
        // Verificar se o departamento está com prazo expirado (nova lógica)
        if (process.is_department_overdue) {
          status = 'overdue';
        } else {
          // Se o departamento não estiver com prazo expirado, verificar prazo geral
          const expectedEndDate = new Date(process.data_fim_esperada);
          const now = new Date();
          
          status = now > expectedEndDate ? 'overdue' : 'pending';
        }
      }

      // Formatar o histórico
      const history = process.processos_historico ? process.processos_historico.map((h: any) => ({
        departmentId: h.setor_id,
        entryDate: h.data_entrada,
        exitDate: h.data_saida,
        userId: h.usuario_id || ""
      })) : [];

      return {
        id: process.id,
        protocolNumber: process.numero_protocolo,
        processType: process.tipo_processo,
        currentDepartment: process.setor_atual,
        startDate: process.data_inicio,
        expectedEndDate: process.data_fim_esperada,
        status,
        history,
        userId: process.usuario_id,
        responsibleUserId: process.usuario_responsavel,
        isDepartmentOverdue: process.is_department_overdue || false
      };
    }) : [];
  };

  return { formatProcesses };
};
