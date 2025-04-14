import { Process } from "@/types";
import { useAuth } from "@/hooks/auth";
import { useMemo, useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ResponsibilityCheckers {
  isUserResponsibleForProcess?: (process: Process, userId: string) => boolean;
  isUserResponsibleForSector?: (process: Process, userId: string) => boolean;
}

export const useProcessFiltering = (
  processes: Process[],
  checkers: ResponsibilityCheckers = {}
) => {
  const { user, isAdmin } = useAuth();
  const [userProfile, setUserProfile] = useState<{ perfil: string, setores_atribuidos: string[] } | null>(null);
  
  useEffect(() => {
    if (!user) return;
    
    const fetchUserProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('perfil, setores_atribuidos')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          return;
        }
        
        setUserProfile(data);
        console.log('Perfil do usuário carregado:', data);
      } catch (err) {
        console.error('Erro ao processar perfil do usuário:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const isUserResponsibleForProcess = checkers.isUserResponsibleForProcess || 
    ((process: Process, userId: string) => {
      return process.userId === userId || process.responsibleUserId === userId;
    });
  
  const isUserResponsibleForSector = checkers.isUserResponsibleForSector || 
    ((process: Process, userId: string) => {
      if (!userProfile || !userProfile.setores_atribuidos || !userProfile.setores_atribuidos.length) return false;
      return userProfile.setores_atribuidos.includes(process.currentDepartment);
    });

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

      const visibleProcesses = baseList.filter((process) => {
        if (!user) return false; // Não autenticado não vê nada
        
        const isUserAdmin = userProfile?.perfil === 'administrador' || isAdmin(user.email);
        if (isUserAdmin) return true; // Admin vê tudo
        
        const isResponsibleForProcess = isUserResponsibleForProcess(process, user.id);
        const isResponsibleForCurrentSector = isUserResponsibleForSector(process, user.id);
        
        return isResponsibleForProcess || isResponsibleForCurrentSector;
      });

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
  }, [processes, user, isAdmin, isUserResponsibleForProcess, isUserResponsibleForSector, userProfile]);

  const isProcessOverdue = (process: Process) => {
    if (process.status === 'overdue') return true;

    const now = new Date();
    const expectedEndDate = new Date(process.expectedEndDate);
    return now > expectedEndDate;
  };

  return {
    filterProcesses,
    isProcessOverdue,
  };
};
