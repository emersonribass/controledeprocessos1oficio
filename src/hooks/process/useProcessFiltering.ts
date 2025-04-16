
import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo, useCallback, useEffect, useState } from "react";
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
  const [sectorResponsibles, setSectorResponsibles] = useState<Record<string, Record<string, string[]>>>({});
  
  // Fetch sector responsibles once when component mounts
  useEffect(() => {
    const fetchSectorResponsibles = async () => {
      if (!user) return;
      
      try {
        const { data, error } = await supabase
          .from('setor_responsaveis')
          .select('processo_id, setor_id, usuario_id');
          
        if (error) {
          console.error("Erro ao buscar responsáveis por setor:", error);
          return;
        }
        
        // Organizar os dados por processo e setor
        const responsiblesMap: Record<string, Record<string, string[]>> = {};
        
        data.forEach(resp => {
          if (!responsiblesMap[resp.processo_id]) {
            responsiblesMap[resp.processo_id] = {};
          }
          
          if (!responsiblesMap[resp.processo_id][resp.setor_id]) {
            responsiblesMap[resp.processo_id][resp.setor_id] = [];
          }
          
          responsiblesMap[resp.processo_id][resp.setor_id].push(resp.usuario_id);
        });
        
        setSectorResponsibles(responsiblesMap);
      } catch (error) {
        console.error("Erro ao processar responsáveis por setor:", error);
      }
    };
    
    fetchSectorResponsibles();
  }, [user]);
  
  // Implementação da função isUserResponsibleForProcess com cache interno
  const isUserResponsibleForProcess = useCallback((process: Process, userId: string) => {
    // Verificar somente responsabilidade direta pelo processo (atual)
    return process.userId === userId || process.responsibleUserId === userId;
  }, []);
  
  // Nova implementação da função isUserResponsibleForSector que verifica a tabela setor_responsaveis
  const isUserResponsibleForSector = useCallback((process: Process, userId: string) => {
    // Verificar na tabela setor_responsaveis se o usuário está associado ao setor atual do processo
    if (!sectorResponsibles[process.id] || !sectorResponsibles[process.id][process.currentDepartment]) {
      return false;
    }
    
    return sectorResponsibles[process.id][process.currentDepartment].includes(userId);
  }, [sectorResponsibles]);
    
  // Verificar se o usuário pertence ao setor de atendimento (assumindo que o setor 1 é o de atendimento)
  const isUserInAttendanceSector = useCallback(() => {
    return userProfile?.setores_atribuidos?.includes("1") || false;
  }, [userProfile]);

  // Função de filtro memoizada para melhor performance
  const filterProcesses = useMemo(() => {
    return (
      filters: {
        department?: string;
        status?: string;
        processType?: string;
        search?: string;
        excludeCompleted?: boolean;
      },
      processesToFilter?: Process[]
    ): Process[] => {
      const baseList = processesToFilter || processes;

      // Primeiro filtrar por permissões do usuário
      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        // Verificar se o usuário é administrador
        const isUserAdmin = isAdmin();
        if (isUserAdmin) return true;
        
        // Usuários do setor de atendimento podem ver processos não iniciados
        if (process.status === 'not_started' && isUserInAttendanceSector()) {
          return true;
        }
        
        // Verificar se o usuário é responsável direto pelo processo (atual)
        const isResponsibleForProcess = isUserResponsibleForProcess(process, user.id);
        if (isResponsibleForProcess) return true;
        
        // Verificar se o usuário é responsável pelo setor atual do processo na tabela setor_responsaveis
        const isResponsibleForCurrentSector = isUserResponsibleForSector(process, user.id);
        if (isResponsibleForCurrentSector) return true;
        
        // Se nenhuma das condições acima for verdadeira, o usuário não deve ver o processo
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
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserResponsibleForSector, isUserInAttendanceSector, sectorResponsibles]);

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
    isUserInAttendanceSector
  };
};
