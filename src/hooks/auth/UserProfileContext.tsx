
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export interface UserProfile {
  id?: string;
  perfil?: string;
  setores_atribuidos?: string[];
}

interface UserProfileContextType {
  userProfile: UserProfile | null;
  isLoading: boolean;
  isAdmin: () => boolean;
  getUserSectors: () => string[];
  refreshUserProfile: () => Promise<void>;
}

const UserProfileContext = createContext<UserProfileContextType | undefined>(undefined);

export const UserProfileProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastFetchTime, setLastFetchTime] = useState<number>(0);
  
  // Cache expira após 5 minutos (300000 ms)
  const CACHE_EXPIRY = 300000;
  
  const fetchUserProfile = async () => {
    if (!user) {
      setUserProfile(null);
      return;
    }
    
    const currentTime = Date.now();
    // Se já temos dados em cache e eles ainda são válidos, não buscar novamente
    if (userProfile && (currentTime - lastFetchTime) < CACHE_EXPIRY) {
      return;
    }
    
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
        setLastFetchTime(currentTime);
      }
    } catch (err) {
      console.error('Erro ao processar perfil do usuário:', err);
      setUserProfile(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const refreshUserProfile = async () => {
    // Forçar uma nova busca ignorando o cache
    setLastFetchTime(0);
    await fetchUserProfile();
  };
  
  // Carregar perfil quando o usuário mudar
  useEffect(() => {
    fetchUserProfile();
  }, [user]);
  
  const isAdmin = () => {
    return userProfile?.perfil === 'administrador';
  };
  
  const getUserSectors = () => {
    return userProfile?.setores_atribuidos || [];
  };
  
  return (
    <UserProfileContext.Provider value={{
      userProfile,
      isLoading,
      isAdmin,
      getUserSectors,
      refreshUserProfile
    }}>
      {children}
    </UserProfileContext.Provider>
  );
};

export const useUserProfile = (): UserProfileContextType => {
  const context = useContext(UserProfileContext);
  if (context === undefined) {
    throw new Error('useUserProfile deve ser usado dentro de um UserProfileProvider');
  }
  return context;
};
