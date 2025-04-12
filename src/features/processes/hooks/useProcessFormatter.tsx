
import { Process, PROCESS_STATUS, ProcessStatus, HistoryEntry } from "@/types";
import { Tables } from "@/integrations/supabase/types";

// Definir tipos específicos para dados brutos do Supabase
type ProcessoRaw = Tables<"processos"> & {
  historico: HistoricoRaw[];
  setor_info?: {
    time_limit: number;
  };
};

type HistoricoRaw = Tables<"processos_historico"> & {
  usuario_nome?: string;
};

export const useProcessFormatter = () => {
  const formatProcesses = (processesData: ProcessoRaw[]): Process[] => {
    return processesData.map(processo => {
      // Converter formato de histórico
      const history: HistoryEntry[] = processo.historico.map(historico => ({
        id: historico.id,
        processId: historico.processo_id,
        departmentId: historico.setor_id,
        entryDate: historico.data_entrada,
        exitDate: historico.data_saida || undefined,
        userId: historico.usuario_id || "",
        userName: historico.usuario_nome || "Usuário",
        usuario_responsavel_setor: historico.usuario_responsavel_setor || undefined
      }));

      // Mapeamento de status
      const statusMap: Record<string, ProcessStatus> = {
        "Não iniciado": PROCESS_STATUS.NOT_STARTED,
        "Em andamento": PROCESS_STATUS.PENDING,
        "Concluído": PROCESS_STATUS.COMPLETED,
        "Atrasado": PROCESS_STATUS.OVERDUE
      };

      // Formatar para nosso tipo Process
      const formattedProcess: Process = {
        id: processo.id,
        protocolNumber: processo.numero_protocolo,
        processType: processo.tipo_processo,
        currentDepartment: processo.setor_atual || "",
        status: statusMap[processo.status] || PROCESS_STATUS.NOT_STARTED,
        startDate: processo.data_inicio || new Date().toISOString(),
        expectedEndDate: processo.data_fim_esperada || new Date().toISOString(),
        responsibleUser: processo.usuario_responsavel,
        history: history
      };

      return formattedProcess;
    });
  };

  return { formatProcesses };
};
