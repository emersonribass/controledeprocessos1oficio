import { createContext, useContext, ReactNode, useState, useEffect } from "react";
import { Process } from "@/types";
import { useDepartmentsData } from "@/hooks/useDepartmentsData";
import { useProcessTypes } from "@/hooks/useProcessTypes";
import { useProcessesFetch } from "@/hooks/useProcessesFetch";
import { useProcessOperations } from "@/hooks/process/useProcessOperations";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";
import { useProcessResponsibility } from "@/hooks/useProcessResponsibility";
import { useAuth } from "@/hooks/auth"; // Importação do hook useAuth
import { supabase } from "@/integrations/supabase/client";

// Definição do tipo para o contexto
type ProcessesContextType = {
  processes: Process[];
  filterProcesses: (filters: {
    department?: string;
    status?: string;
    processType?: string;
    search?: string;
    excludeCompleted?: boolean;
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
  deleteProcess: (processId: string) => Promise<boolean>;
  deleteManyProcesses: (processIds: string[]) => Promise<boolean>;
  getProcess: (processId: string) => Promise<Process | null>;
  isUserResponsibleForProcess: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector: (process: Process, userId: string) => boolean;
};

// Criação do contexto
const ProcessesContext = createContext<ProcessesContextType | undefined>(undefined);

/**
 * Provider para o contexto de processos
 */
export const ProcessesProvider = ({ children }: { children: ReactNode }) => {
  const { departments, getDepartmentName } = useDepartmentsData();
  const { processTypes, getProcessTypeName } = useProcessTypes();
  const { processes, isLoading, fetchProcesses } = useProcessesFetch();
  const { user } = useAuth(); // Usando o hook useAuth para obter o usuário logado
  const [userProfile, setUserProfile] = useState<{ setores_atribuidos: string[] } | null>(null);
  
  // Buscar perfil do usuário na tabela usuarios
  useEffect(() => {
    if (!user) return;
    
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('setores_atribuidos')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          return;
        }
        
        setUserProfile(data);
        console.log('Perfil do usuário carregado no contexto:', data);
      } catch (err) {
        console.error('Erro ao processar perfil do usuário:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  // Funções síncronas para verificar responsabilidade
  const isUserResponsibleForProcess = (process: Process, userId: string): boolean => {
    // Implementação estrita - usuário deve ser o responsável direto pelo processo
    return process.userId === userId || process.responsibleUserId === userId;
  };
  
  const isUserResponsibleForSector = (process: Process, userId: string): boolean => {
    if (!userProfile || !userProfile.setores_atribuidos || !userProfile.setores_atribuidos.length) return false;
    // Verifica se o usuário pertence ao departamento atual do processo - usando dados da tabela 'usuarios'
    return userProfile.setores_atribuidos.includes(process.currentDepartment);
  };
  
  // Passar funções de verificação para o hook
  const { filterProcesses, isProcessOverdue } = useProcessFiltering(processes, {
    isUserResponsibleForProcess,
    isUserResponsibleForSector
  });
  
  // Hook de operações de processos
  const { 
    moveProcessToNextDepartment: moveNext,
    moveProcessToPreviousDepartment: movePrevious,
    startProcess: startProcessBase,
    deleteProcess,
    deleteManyProcesses,
    updateProcessType: updateType,
    updateProcessStatus: updateStatus,
    getProcess
  } = useProcessOperations(() => fetchProcesses());

  // Adaptadores para converter Promise<boolean> para Promise<void>
  const moveProcessToNextDepartment = async (processId: string): Promise<void> => {
    await moveNext(processId);
  };

  const moveProcessToPreviousDepartment = async (processId: string): Promise<void> => {
    await movePrevious(processId);
  };

  const startProcess = async (processId: string): Promise<void> => {
    await startProcessBase(processId);
  };

  const updateProcessType = async (processId: string, newTypeId: string): Promise<void> => {
    await updateType(processId, newTypeId);
  };

  const updateProcessStatus = async (
    processId: string, 
    newStatus: 'Em andamento' | 'Concluído' | 'Não iniciado'
  ): Promise<void> => {
    await updateStatus(processId, newStatus);
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
        getProcess,
        isUserResponsibleForProcess,
        isUserResponsibleForSector
      }}
    >
      {children}
    </ProcessesContext.Provider>
  );
};

/**
 * Hook para acessar o contexto de processos
 */
export const useProcesses = () => {
  const context = useContext(ProcessesContext);
  if (context === undefined) {
    throw new Error("useProcesses must be used within a ProcessesProvider");
  }
  return context;
};
