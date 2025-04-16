
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export interface UserProfile {
  id?: string;
  perfil?: string;
  setores_atribuidos?: string[];
}

export const useUserProfile = () => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    const fetchUserProfile = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('usuarios')
          .select('id, perfil, setores_atribuidos')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          setUserProfile(null);
        } else {
          console.log('Perfil do usuário carregado:', data);
          setUserProfile(data);
        }
      } catch (err) {
        console.error('Erro ao processar perfil do usuário:', err);
        setUserProfile(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [user]);
  
  const isAdmin = () => {
    return userProfile?.perfil === 'administrador';
  };
  
  const getUserSectors = () => {
    return userProfile?.setores_atribuidos || [];
  };
  
  return {
    userProfile,
    isLoading,
    isAdmin,
    getUserSectors
  };
};
