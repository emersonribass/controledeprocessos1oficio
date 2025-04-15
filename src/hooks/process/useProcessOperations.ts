
import { Process } from "@/types";
import { useProcessMovement } from "@/hooks/useProcessMovement";
import { useProcessUpdate } from "@/hooks/useProcessUpdate";
import { supabaseService } from "@/services/supabase";
import { useAuth } from "@/hooks/auth";

/**
 * Hook que centraliza operações de processos: movimentação, atualização e busca individual
 */
export const useProcessOperations = (onProcessUpdated: () => void) => {
  const { user } = useAuth();
  
  // Operações de movimentação
  const { 
    moveProcessToNextDepartment, 
    moveProcessToPreviousDepartment, 
    startProcess,
    deleteProcess,
    deleteManyProcesses,
    isMoving,
    isStarting
  } = useProcessMovement(onProcessUpdated);

  // Operações de atualização
  const { 
    updateProcessType,
    updateProcessStatus
  } = useProcessUpdate();

  // Busca um processo específico
  const getProcess = async (processId: string): Promise<Process | null> => {
    try {
      // Verificar se o usuário está autenticado
      if (!user) throw new Error("Usuário não autenticado");
      
      console.log(`Buscando processo ${processId} para usuário ${user.id}`);
      
      const { data, error } = await supabaseService.getProcess(processId);
        
      if (error) throw error;
      if (!data) {
        console.warn(`Processo ${processId} não encontrado ou acesso negado`);
        return null;
      }
      
      console.log(`Processo encontrado:`, data);
      
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

  return {
    // Operações de movimentação
    moveProcessToNextDepartment,
    moveProcessToPreviousDepartment,
    startProcess,
    deleteProcess,
    deleteManyProcesses,
    
    // Operações de atualização
    updateProcessType,
    updateProcessStatus,
    
    // Busca individual
    getProcess,
    
    // Estados
    isMoving,
    isStarting
  };
};
