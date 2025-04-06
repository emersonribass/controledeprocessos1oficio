
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
            userId: h.usuario_id || "1"
          })) : []
        };
      }
      
      // Se não for "Não iniciado", verificar outros status
      if (process.status === 'Concluído') {
        status = 'completed';
      } else {
        // Verificar a data final esperada geral
        const expectedEndDate = new Date(process.data_fim_esperada);
        const now = new Date();
        
        // Verificar prazo do departamento atual
        let isDepartmentOverdue = false;
        const currentDeptHistory = process.processos_historico?.find(
          (h: any) => h.setor_id === process.setor_atual && h.data_saida === null
        );
        
        if (currentDeptHistory) {
          const entryDate = new Date(currentDeptHistory.data_entrada);
          const departmentTimeLimit = process.setor_info?.time_limit || 0;
          
          if (departmentTimeLimit > 0) {
            // Calcular data limite para o departamento atual
            const deptDeadline = new Date(entryDate);
            deptDeadline.setDate(deptDeadline.getDate() + departmentTimeLimit);
            
            // Verificar se ultrapassou o prazo do departamento
            if (now > deptDeadline) {
              isDepartmentOverdue = true;
            }
          }
        }
        
        // Determinar status com base em ambas verificações
        if (isDepartmentOverdue || now > expectedEndDate) {
          status = 'overdue';
        } else {
          status = 'pending';
        }
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
