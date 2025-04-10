
import { createContext, useContext, ReactNode } from "react";
import { AuthContextType } from "./types";
import { useAuthProvider } from "./useAuthProvider";
import { isAdmin } from "./permissions";

// Certifique-se de inicializar o contexto com um valor undefined
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Componente AuthProvider que fornece o contexto de autenticação para a aplicação
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const auth = useAuthProvider();

  // Criando um valor compatível com o tipo AuthContextType
  const authContextValue: AuthContextType = {
    ...auth,
    isAdmin,
    // Garantir que os setters estão disponíveis para uso em outros componentes
    setUser: auth.setUser,
    setSession: auth.setSession
  };

  return (
    <AuthContext.Provider value={authContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook para usar o contexto de autenticação
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
