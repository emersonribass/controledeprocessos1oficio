
import { Process } from "@/types";
import { useProcessFiltering } from "@/hooks/process/useProcessFiltering";
import { useProcesses } from "@/hooks/useProcesses";
import { useAuth } from "@/hooks/auth";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useProcessFilters = (processes: Process[]) => {
  const { isUserResponsibleForProcess } = useProcesses();
  const { user } = useAuth();
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
        console.log('Setores do usuário carregados:', data);
      } catch (err) {
        console.error('Erro ao processar perfil do usuário:', err);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  return useProcessFiltering(processes, {
    isUserResponsibleForProcess,
    isUserResponsibleForSector: (process: Process, userId: string) => {
      if (!userProfile || !userProfile.setores_atribuidos || !userProfile.setores_atribuidos.length) return false;
      // Verificação estrita para garantir que o usuário pertence ao departamento atual do processo
      return userProfile.setores_atribuidos.includes(process.currentDepartment);
    }
  });
};
