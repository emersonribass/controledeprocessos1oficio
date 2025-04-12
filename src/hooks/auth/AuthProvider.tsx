
import { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthProvider } from "./useAuthProvider";
import { isAdmin, isAdminSync } from "./permissions";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  return (
    <AuthContext.Provider value={{ ...auth, isAdmin, isAdminSync }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
