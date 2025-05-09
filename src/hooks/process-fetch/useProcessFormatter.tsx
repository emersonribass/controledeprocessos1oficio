
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
          responsibleUserId: process.usuario_responsavel
        };
      }
      
      // Se não for "Não iniciado", verificar outros status
      if (process.status === 'Concluído') {
        status = 'completed';
      } else {
        // Verificar o prazo do departamento atual (prioridade máxima)
        let isDepartmentOverdue = false;
        
        // Buscar TODAS as entradas do histórico para o departamento atual
        const currentDeptEntries = process.processos_historico?.filter(
          (h: any) => h.setor_id === process.setor_atual
        ) || [];
        
        // Ordenar do mais recente para o mais antigo
        currentDeptEntries.sort((a: any, b: any) => {
          return new Date(b.data_entrada).getTime() - new Date(a.data_entrada).getTime();
        });
        
        // Pegar a entrada mais recente sem data de saída (entrada atual)
        const currentDeptHistory = currentDeptEntries.find((h: any) => h.data_saida === null);
        
        if (currentDeptHistory) {
          const entryDate = new Date(currentDeptHistory.data_entrada);
          const departmentTimeLimit = process.setor_info?.time_limit || 0;
          
          if (departmentTimeLimit > 0) {
            // Calcular data limite para o departamento atual usando a data de entrada mais recente
            const deptDeadline = new Date(entryDate);
            deptDeadline.setDate(deptDeadline.getDate() + departmentTimeLimit);
            
            // Verificar se ultrapassou o prazo do departamento
            const now = new Date();
            if (now > deptDeadline) {
              isDepartmentOverdue = true;
            }
          }
        }
        
        // Se o prazo do departamento estiver expirado, o processo está atrasado
        // Não precisamos mais verificar o prazo geral se o departamento já estiver atrasado
        if (isDepartmentOverdue) {
          status = 'overdue';
        } else {
          // Verificar a data final esperada geral apenas se o departamento não estiver atrasado
          const expectedEndDate = new Date(process.data_fim_esperada);
          const now = new Date();
          
          if (now > expectedEndDate) {
            status = 'overdue';
          } else {
            status = 'pending';
          }
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
        responsibleUserId: process.usuario_responsavel
      };
    }) : [];
  };

  return { formatProcesses };
};
