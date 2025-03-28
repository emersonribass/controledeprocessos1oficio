
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { mockUsers } from "@/lib/mockData";
import { toast } from "sonner";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check for user in localStorage (simulating persistent sessions)
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Simulate API delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Simple mock authentication
      if (password !== "password") {
        throw new Error("Credenciais inválidas");
      }

      const foundUser = mockUsers.find((u) => u.email === email);
      if (!foundUser) {
        throw new Error("Usuário não encontrado");
      }

      // Store user in localStorage for session persistence
      localStorage.setItem("user", JSON.stringify(foundUser));
      setUser(foundUser);
      toast.success("Login realizado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao realizar login");
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    toast.info("Sessão encerrada");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading }}>
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
