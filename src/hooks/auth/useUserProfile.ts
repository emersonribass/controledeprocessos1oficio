
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { toast } from "@/hooks/use-toast";

export interface UserProfile {
  id?: string;
  perfil?: string;
  setores_atribuidos?: string[];
  nome?: string;
  email?: string;
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
          .select('id, perfil, setores_atribuidos, nome, email')
          .eq('id', user.id)
          .single();
        
        if (error) {
          console.error('Erro ao buscar perfil do usuário:', error);
          toast({
            title: "Erro ao carregar perfil",
            description: "Não foi possível carregar seus dados de perfil",
            variant: "destructive"
          });
          setUserProfile(null);
        } else {
          console.log('Perfil do usuário carregado:', data);
          if (data.setores_atribuidos) {
            console.log('Setores atribuídos:', data.setores_atribuidos);
          } else {
            console.warn('Usuário sem setores atribuídos');
          }
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
  
  // Função para verificar se o usuário é administrador
  const isAdmin = () => {
    return userProfile?.perfil === 'administrador';
  };
  
  // Função para obter os setores do usuário
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
