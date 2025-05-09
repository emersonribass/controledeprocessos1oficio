
import { useUserProfile as useUserProfileContext } from "./UserProfileContext";

// Este hook é apenas um wrapper em torno do novo hook de contexto
// para manter a compatibilidade com o código existente
export const useUserProfile = () => {
  const { userProfile, isLoading, isAdmin, getUserSectors, refreshUserProfile } = useUserProfileContext();
  
  return {
    userProfile,
    isLoading,
    isAdmin,
    getUserSectors,
    refreshUserProfile
  };
};

// Utilizando 'export type' para exportar o tipo conforme recomendado quando isolatedModules está ativado
export type { UserProfile } from "./UserProfileContext";
