
import { Process, PROCESS_STATUS, ProcessStatus } from "@/types";

interface ProcessoRaw {
  id: string;
  numero_protocolo: string;
  tipo_processo: string;
  setor_atual: string | null;
  status: string;
  data_inicio: string | null;
  data_fim_esperada: string;
  usuario_responsavel: string | null;
  historico: HistoricoRaw[];
}

interface HistoricoRaw {
  id: string;
  processo_id: string;
  setor_id: string;
  data_entrada: string;
  data_saida: string | null;
  usuario_id: string | null;
  usuario_responsavel_setor: string | null;
  usuario_nome?: string;
}

export const useProcessFormatter = () => {
  const formatProcesses = (processesData: ProcessoRaw[]): Process[] => {
    return processesData.map(processo => {
      // Converter formato de histórico
      const history = processo.historico.map(historico => ({
        id: historico.id,
        processId: historico.processo_id,
        departmentId: historico.setor_id,
        entryDate: historico.data_entrada,
        exitDate: historico.data_saida || null,
        userId: historico.usuario_id || "",
        userName: historico.usuario_nome || "Usuário"
      }));

      // Mapeamento de status
      const statusMap: { [key: string]: ProcessStatus } = {
        "Não iniciado": PROCESS_STATUS.NOT_STARTED,
        "Em andamento": PROCESS_STATUS.PENDING,
        "Concluído": PROCESS_STATUS.COMPLETED,
        "Atrasado": PROCESS_STATUS.OVERDUE
      };

      // Formatar data de início (se existir)
      const formattedStartDate = processo.data_inicio 
        ? processo.data_inicio 
        : null;

      // Formatar para nosso tipo Process
      const formattedProcess: Process = {
        id: processo.id,
        protocolNumber: processo.numero_protocolo,
        processType: processo.tipo_processo,
        currentDepartment: processo.setor_atual || "",
        status: statusMap[processo.status] || PROCESS_STATUS.NOT_STARTED,
        startDate: formattedStartDate,
        expectedEndDate: processo.data_fim_esperada,
        responsibleUser: processo.usuario_responsavel,
        history: history
      };

      return formattedProcess;
    });
  };

  return { formatProcesses };
};
