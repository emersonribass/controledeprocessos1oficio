
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo } from "react";
import { useUserProfile } from "@/hooks/auth/useUserProfile";
import { supabase } from "@/integrations/supabase/client";

interface ResponsibilityCheckers {
  isUserResponsibleForProcess?: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector?: (process: Process, userId: string) => boolean;
}

export const useProcessFiltering = (
  processes: Process[],
  checkers: ResponsibilityCheckers = {}
) => {
  const { user } = useAuth();
  const { userProfile, isAdmin } = useUserProfile();
  
  // Usar as funções de verificação passadas ou usar as implementações padrão
  const isUserResponsibleForProcess = checkers.isUserResponsibleForProcess || 
    ((process: Process, userId: string) => {
      // Verifica se o usuário é o criador ou o responsável direto pelo processo
      return process.userId === userId || process.responsibleUserId === userId;
    });
  
  // Nova implementação mais restritiva: usa a tabela setor_responsaveis
  const isUserResponsibleForSector = checkers.isUserResponsibleForSector || 
    ((process: Process, userId: string) => {
      // Não precisamos mais da verificação de pertencer ao setor
      // Agora verificamos apenas se o usuário é responsável específico para este processo neste setor
      // Esta verificação será feita diretamente no filterProcesses usando o cache
      return false;
    });
    
  // Verificar se o usuário pertence ao setor de atendimento (assumindo que o setor 1 é o de atendimento)
  const isUserInAttendanceSector = () => {
    return userProfile?.setores_atribuidos?.includes("1") || false;
  };

  // Cache de responsabilidades por processo e setor - implementado dentro do hook
  const processResponsibilitiesCache = useMemo(() => {
    const cache: Record<string, Record<string, boolean>> = {};
    
    // Pré-inicializa o cache com valores vazios para cada processo
    processes.forEach(process => {
      if (!cache[process.id]) {
        cache[process.id] = {};
      }
    });
    
    return cache;
  }, [processes]);
  
  // Função para verificar e armazenar em cache se um usuário é responsável por um processo em um setor
  const checkAndCacheResponsibility = async (processId: string, sectorId: string, userId: string): Promise<boolean> => {
    // Verificar se já temos no cache
    if (processResponsibilitiesCache[processId] && 
        processResponsibilitiesCache[processId][sectorId] !== undefined) {
      return processResponsibilitiesCache[processId][sectorId];
    }
    
    try {
      // Consultar a tabela setor_responsaveis
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .eq('usuario_id', userId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar responsabilidade:", error);
        return false;
      }
      
      // Armazenar resultado no cache
      const isResponsible = !!data;
      if (!processResponsibilitiesCache[processId]) {
        processResponsibilitiesCache[processId] = {};
      }
      processResponsibilitiesCache[processId][sectorId] = isResponsible;
      
      return isResponsible;
    } catch (error) {
      console.error("Erro ao verificar responsabilidade para setor:", error);
      return false;
    }
  };

  const filterProcesses = useMemo(() => {
    return (
      filters: {
        department?: string;
        status?: string;
        processType?: string;
        search?: string;
        excludeCompleted?: boolean;
      },
      processesToFilter?: Process[],
      processesResponsibles?: Record<string, any>
    ): Process[] => {
      const baseList = processesToFilter || processes;

      // Primeiro filtrar por permissões do usuário - lógica mais restritiva aqui
      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        // Verificar se o usuário é administrador - admins veem tudo
        const isUserAdmin = isAdmin();
        if (isUserAdmin) return true;
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          return true;
        }
        
        // Verificar se o usuário é responsável direto pelo processo
        const isResponsibleForProcess = isUserResponsibleForProcess(process, user.id);
        if (isResponsibleForProcess) {
          return true;
        }
        
        // Verificar se o usuário é responsável específico para este processo neste setor
        // Usando o cache de responsabilidades (processesResponsibles)
        if (processesResponsibles && 
            processesResponsibles[process.id] && 
            processesResponsibles[process.id][process.currentDepartment]) {
          
          const sectorResponsible = processesResponsibles[process.id][process.currentDepartment];
          // Verificar se o responsável é o usuário atual
          return sectorResponsible && sectorResponsible.usuario_id === user.id;
        }
        
        // Se não temos informação de responsáveis, o processo não deve ser visível
        return false;
      });

      // Depois aplicar os filtros selecionados pelo usuário
      return visibleProcesses.filter((process) => {
        if (filters.excludeCompleted && process.status === 'completed') {
          return false;
        }

        if (filters.department && process.currentDepartment !== filters.department) {
          return false;
        }

        if (filters.status) {
          const statusMap: Record<string, string> = {
            pending: "pending",
            completed: "completed",
            overdue: "overdue",
            not_started: "not_started",
          };
          if (process.status !== statusMap[filters.status]) {
            return false;
          }
        }

        if (filters.processType && process.processType !== filters.processType) {
          return false;
        }

        if (filters.search &&
          !process.protocolNumber.toLowerCase().includes(filters.search.toLowerCase())
        ) {
          return false;
        }

        return true;
      });
    };
  }, [processes, user, isAdmin, isUserResponsibleForProcess, processResponsibilitiesCache, isUserInAttendanceSector]);

  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
    // Exportar as funções de verificação para reuso
    isUserResponsibleForProcess,
    isUserResponsibleForSector,
    isUserInAttendanceSector,
    checkAndCacheResponsibility
  };
};
