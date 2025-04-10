
import { useSession } from "./useSession";
import { useLogin } from "./useLogin";
import { useLogout } from "./useLogout";

export const useAuthProvider = () => {
  const { user, session, isLoading, setUser, setSession, setIsLoading } = useSession();
  const { login } = useLogin({ setUser, setSession, setIsLoading });
  const { logout } = useLogout({ setUser, setSession, setIsLoading });

  return {
    user,
    session,
    isLoading,
    login,
    logout,
    setUser,
    setSession,
    setIsLoading
  };
};
