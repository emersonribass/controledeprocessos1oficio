
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

export { UserProfile } from "./UserProfileContext";
