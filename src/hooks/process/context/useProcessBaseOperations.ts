
import { Process } from "@/types";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessHookAdapters } from "./useProcessHookAdapters";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { supabaseService } from "@/services/supabase";

/**
 * Hook para gerenciar as operações básicas de processos
 */
export const useProcessBaseOperations = (refreshProcesses: () => Promise<void>) => {
  // Hook de operações de movimentação e exclusão
  const { 
    moveProcessToNextDepartment: moveNext,
    moveProcessToPreviousDepartment: movePrevious,
    startProcess: startProcessBase,
    deleteProcess,
    deleteManyProcesses
  } = useProcessMovement(() => refreshProcesses());
  
  // Hook de operações de atualização
  const {
    updateProcessType: updateType,
    updateProcessStatus: updateStatus
  } = useProcessUpdate();
  
  // Busca um processo específico
  const getProcess = async (processId: string): Promise<Process | null> => {
    try {
      const { data, error } = await supabaseService.getProcess(processId);
        
      if (error) throw error;
      if (!data) return null;
      
      const formattedProcess: Process = {
        id: data.id,
        protocolNumber: data.numero_protocolo,
        processType: data.tipo_processo,
        currentDepartment: data.setor_atual,
        startDate: data.data_inicio || new Date().toISOString(),
        expectedEndDate: data.data_fim_esperada || new Date().toISOString(),
        status: data.status === 'Em andamento' 
          ? 'pending' 
          : data.status === 'Concluído' 
            ? 'completed' 
            : data.status === 'Arquivado'
              ? 'archived'
              : 'not_started',
        history: data.processos_historico.map((h: any) => ({
          departmentId: h.setor_id,
          entryDate: h.data_entrada,
          exitDate: h.data_saida,
          userId: h.usuario_id || '',
        })),
        userId: data.usuario_responsavel,
        responsibleUserId: data.usuario_responsavel,
      };
      
      return formattedProcess;
    } catch (error) {
      console.error('Erro ao buscar processo:', error);
      return null;
    }
  };
  
  // Adaptadores para converter retornos de Promise<boolean> para Promise<void>
  const {
    adaptMoveToNext,
    adaptMoveToPrevious,
    adaptStartProcess,
    adaptUpdateType,
    adaptUpdateStatus
  } = useProcessHookAdapters(refreshProcesses);
  
  // Adaptando as funções com os adaptadores
  const moveProcessToNextDepartment = async (processId: string): Promise<void> => {
    await adaptMoveToNext(moveNext, processId);
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<void> => {
    await adaptMoveToPrevious(movePrevious, processId);
  };

  const startProcess = async (processId: string): Promise<void> => {
    await adaptStartProcess(startProcessBase, processId);
  };

  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    await adaptUpdateType(updateType, processId, newTypeId);
  };

  const updateProcessStatus = async (
    processId: string, 
    newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'
  ): Promise<void> => {
    await adaptUpdateStatus(updateStatus, processId, newStatus);
  };

  return {
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess,
    updateProcessType,
    updateProcessStatus,
    deleteProcess,
    deleteManyProcesses,
    getProcess
  };
};
