
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
  
  // Verificar se o usuário pertence ao setor atual do processo
  const isUserInCurrentSector = (process: Process) => {
    if (!userProfile?.setores_atribuidos || !process.currentDepartment) {
      return false;
    }
    return userProfile.setores_atribuidos.includes(process.currentDepartment);
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
  
  // Função para verificar se existe um responsável para o processo no setor
  const hasSectorResponsible = async (processId: string, sectorId: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('setor_responsaveis')
        .select('*')
        .eq('processo_id', processId)
        .eq('setor_id', sectorId)
        .maybeSingle();
      
      if (error) {
        console.error("Erro ao verificar existência de responsável no setor:", error);
        return false;
      }
      
      return !!data;
    } catch (error) {
      console.error("Erro ao verificar responsáveis de setor:", error);
      return false;
    }
  };

  const filterProcesses = useMemo(() => {
    return async (
      filters: {
        department?: string;
        status?: string;
        processType?: string;
        search?: string;
        excludeCompleted?: boolean;
      },
      processesToFilter?: Process[],
      processesResponsibles?: Record<string, any>
    ): Promise<Process[]> => {
      const baseList = processesToFilter || processes;

      // Primeiro filtrar por permissões do usuário - lógica mais restritiva aqui
      const visibleProcessesPromises = baseList.map(async (process) => {
        if (!user) return null; // Não autenticado não vê nada
        
        // Verificar se o usuário é administrador - admins veem tudo
        const isUserAdmin = isAdmin();
        if (isUserAdmin) return process;
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          return process;
        }
        
        // Verificar se o usuário é responsável direto pelo processo
        const isResponsibleForProcess = isUserResponsibleForProcess(process, user.id);
        if (isResponsibleForProcess) {
          return process;
        }
        
        // NOVA REGRA 1: Verificar se o usuário pertence ao setor atual do processo E o processo ainda não tem responsável
        if (isUserInCurrentSector(process)) {
          // Verificar se já existe um responsável para o processo no setor atual
          const hasResponsible = await hasSectorResponsible(process.id, process.currentDepartment);
          
          // Se NÃO existe responsável, o usuário pode ver o processo
          if (!hasResponsible) {
            return process;
          }
        }
        
        // NOVA REGRA 2: Verificar se o usuário é responsável específico para este processo neste setor
        // Usando o cache de responsabilidades (processesResponsibles) ou fazendo consulta direta
        if (processesResponsibles && 
            processesResponsibles[process.id] && 
            processesResponsibles[process.id][process.currentDepartment]) {
          
          const sectorResponsible = processesResponsibles[process.id][process.currentDepartment];
          // Verificar se o responsável é o usuário atual
          if (sectorResponsible && sectorResponsible.usuario_id === user.id) {
            return process;
          }
        } else {
          // Se não temos o cache de responsáveis, fazer a verificação direta
          const isResponsible = await checkAndCacheResponsibility(
            process.id,
            process.currentDepartment,
            user.id
          );
          
          if (isResponsible) {
            return process;
          }
        }
        
        // Se não atende a nenhuma das condições acima, o processo não deve ser visível
        return null;
      });
      
      // Resolver todas as promessas
      const visibleProcessesResults = await Promise.all(visibleProcessesPromises);
      
      // Filtrar os resultados nulos (processos não visíveis)
      const visibleProcesses = visibleProcessesResults.filter(
        (process): process is Process => process !== null
      );

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
  }, [processes, user, isAdmin, isUserResponsibleForProcess, processResponsibilitiesCache, isUserInAttendanceSector, isUserInCurrentSector, hasSectorResponsible, checkAndCacheResponsibility]);

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
    isUserInCurrentSector,
    checkAndCacheResponsibility,
    hasSectorResponsible
  };
};
