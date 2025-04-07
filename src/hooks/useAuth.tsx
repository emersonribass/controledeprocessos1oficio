
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  session: null;
  isAdmin: (email: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de emails de administradores
const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com", "emerson@nottar.com.br"];

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Verificar se há sessão do usuário salva localmente
  useEffect(() => {
    const storedUser = localStorage.getItem('nottar_user');
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        console.log("Usuário recuperado do localStorage:", parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Erro ao recuperar sessão do usuário:', error);
        localStorage.removeItem('nottar_user');
      }
    }
    setIsLoading(false);
  }, []);

  // Função para verificar se um email pertence a um administrador
  const isAdmin = (email: string): boolean => {
    console.log("Verificando se é admin:", email);
    const result = adminEmails.includes(email);
    console.log("Resultado da verificação admin:", result);
    return result;
  };

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Tentando login com:", email);
      
      // Buscar o usuário na tabela usuarios pelo email
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .eq('ativo', true)
        .single();

      if (usuarioError) {
        console.error("Erro ao buscar usuário:", usuarioError);
        throw new Error('Usuário não encontrado ou inativo');
      }

      // Verificar se a senha está correta
      if (usuarioData.senha !== password) {
        throw new Error('Senha incorreta');
      }

      console.log("Dados do usuário recuperados:", usuarioData);

      // Criar objeto de usuário para armazenar na sessão
      const loggedUser: User = {
        id: usuarioData.id,
        email: usuarioData.email,
        name: usuarioData.nome,
        departments: usuarioData.setores_atribuidos || [],
        createdAt: usuarioData.created_at,
      };

      // Salvar usuário no estado e no localStorage
      setUser(loggedUser);
      localStorage.setItem('nottar_user', JSON.stringify(loggedUser));
      console.log("Usuário logado com sucesso:", loggedUser);

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

  const logout = async () => {
    try {
      // Remover usuário do estado e do localStorage
      setUser(null);
      localStorage.removeItem('nottar_user');
      toast.info("Sessão encerrada");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, session: null, isAdmin }}>
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
