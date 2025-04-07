
import { Process } from "@/types";

export const useProcessFormatter = () => {
  const formatProcesses = (processesData: { processes: any[], history: any[] }): Process[] => {
    return processesData.processes ? processesData.processes.map(process => {
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
          history: processesData.history
            .filter((h: any) => h.processo_id === process.id)
            .map((h: any) => ({
              departmentId: h.setor_id,
              entryDate: h.data_entrada,
              exitDate: h.data_saida,
              userId: h.usuario_id || ""
            })),
          userId: process.usuario_id,
          responsibleUserId: process.usuario_responsavel
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
        const historyEntries = processesData.history.filter((h: any) => h.processo_id === process.id);
        const currentDeptHistory = historyEntries.find(
          (h: any) => h.setor_id === process.setor_atual && h.data_saida === null
        );
        
        if (currentDeptHistory) {
          const entryDate = new Date(currentDeptHistory.data_entrada);
          // Como não temos mais o "setor_info", precisamos lidar com isso de outra forma
          // Podemos adicionar uma lógica para buscar o time_limit do setor posteriormente
          const departmentTimeLimit = 0; // Valor padrão temporário
          
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
      const history = processesData.history
        .filter((h: any) => h.processo_id === process.id)
        .map((h: any) => ({
          departmentId: h.setor_id,
          entryDate: h.data_entrada,
          exitDate: h.data_saida,
          userId: h.usuario_id || ""
        }));

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
        responsibleUserId: process.usuario_responsavel
      };
    }) : [];
  };

  return { formatProcesses };
};
