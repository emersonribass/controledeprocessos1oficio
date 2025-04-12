
import { createContext, useContext, ReactNode } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessFilters } from "@/hooks/useProcessFilters";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useSupabaseProcesses } from "@/hooks/useSupabaseProcesses";
import { supabase } from "@/integrations/supabase/client";

type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
  }, processesToFilter?: Process[]) => Process[];
  getDepartmentName: (id: string) => string;
  getProcessTypeName: (id: string) => string;
  moveProcessToNextDepartment: (processId: string) => Promise<void>;
  moveProcessToPreviousDepartment: (processId: string) => Promise<void>;
  isProcessOverdue: (process: Process) => boolean;
  departments: ReturnType<typeof useDepartmentsData>["departments"];
  processTypes: ReturnType<typeof useProcessTypes>["processTypes"];
  isLoading: boolean;
  refreshProcesses: () => Promise<void>;
  updateProcessType: (processId: string, newTypeId: string) => Promise<void>;
  updateProcessStatus: (processId: string, newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado') => Promise<void>;
  startProcess: (processId: string) => Promise<void>;
  // Novas funções para excluir processos
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
  getProcess: (processId: string) => Promise<Process | null>;
};

const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { 
    processes, 
    isLoading, 
    fetchProcesses, 
    moveProcessToNextDepartment: moveNext, 
    moveProcessToPreviousDepartment: movePrev,
    updateProcessType,
    updateProcessStatus,
    startProcess: startP,
    deleteProcess,
    deleteManyProcesses
  } = useSupabaseProcesses();
  const { filterProcesses, isProcessOverdue } = useProcessFilters(processes);
  
  // Adaptadores para transformar os retornos boolean em void para a interface do contexto
  const moveProcessToNextDepartment = async (processId: string): Promise<void> => {
    await moveNext(processId);
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<void> => {
    await movePrev(processId);
  };

  const startProcess = async (processId: string): Promise<void> => {
    await startP(processId);
  };
  
  // Adicionar a função getProcess
  const getProcess = async (processId: string): Promise<Process | null> => {
    try {
      const { data, error } = await supabase
        .from('processos')
        .select(`
          *,
          processos_historico(*)
        `)
        .eq('id', processId)
        .single();
        
      if (error) throw error;
      if (!data) return null;
      
      // Converter para o formato Process
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

  return (
    <ProcessesContext.Provider
      value={{
        processes,
        departments,
        processTypes,
        filterProcesses,
        getDepartmentName,
        getProcessTypeName,
        moveProcessToNextDepartment,
        moveProcessToPreviousDepartment,
        isProcessOverdue,
        isLoading,
        refreshProcesses: fetchProcesses,
        updateProcessType,
        updateProcessStatus,
        startProcess,
        deleteProcess,
        deleteManyProcesses,
        getProcess
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
};

export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (context === undefined) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};
