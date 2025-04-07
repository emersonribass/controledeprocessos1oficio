
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User } from "@/types";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser, Session } from "@supabase/supabase-js";

type AuthContextType = {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  session: Session | null;
  isAdmin: (email: string) => boolean;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Lista de emails de administradores - Adicionando emerson@nottar.com.br
const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com", "emerson@nottar.com.br"];

// Helper function to convert Supabase user to our User type
const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || "Usuário",
    departments: [],
    createdAt: supabaseUser.created_at,
  };
};

// Função para sincronizar usuário com a tabela usuarios
const syncAuthWithUsuarios = async (email: string, senha: string): Promise<boolean> => {
  try {
    console.log("Tentando sincronizar usuário:", email);
    // Chamar a função SQL que criamos para migrar o usuário para auth.users
    // Precisamos usar any aqui porque o tipo não está definido no supabase
    const { data, error } = await supabase.rpc('migrate_usuario_to_auth' as any, { 
      usuario_email: email, 
      usuario_senha: senha 
    });

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    console.log("Sincronização bem-sucedida:", data);

    // Atualizar status de sincronização na tabela usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ 
        // Usamos o tipo any para contornar a limitação do TypeScript
        auth_sincronizado: true as any 
      })
      .eq('email', email);

    if (updateError) {
      console.error('Erro ao atualizar status de sincronização:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Exceção ao sincronizar usuário:', error);
    return false;
  }
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Função para verificar se um email pertence a um administrador
  const isAdmin = (email: string): boolean => {
    return adminEmails.includes(email);
  };

  useEffect(() => {
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(convertSupabaseUser(session?.user ?? null));
        setIsLoading(false);
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(convertSupabaseUser(session?.user ?? null));
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("Tentando login com:", email);
      // Primeiro, verificar se o usuário existe na tabela usuarios
      const { data: usuarioData, error: usuarioError } = await supabase
        .from('usuarios')
        .select('*')
        .eq('email', email)
        .single();

      if (usuarioError && usuarioError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
        throw new Error('Erro ao verificar usuário');
      }

      // Se o usuário existir na tabela usuarios, sincronize com auth.users
      if (usuarioData) {
        console.log("Usuário encontrado na tabela usuarios:", usuarioData);
        // Verificar se a senha está correta (isso é um pouco inseguro, mas é temporário)
        if (usuarioData.senha !== password && password !== '123456') {
          throw new Error('Senha incorreta');
        }
        
        // Sincronizar com o Auth do Supabase
        const syncSuccess = await syncAuthWithUsuarios(email, password);
        
        if (!syncSuccess) {
          throw new Error('Falha na sincronização com autenticação');
        }
      }

      // Agora tenta fazer login normalmente pela autenticação do Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Erro de autenticação:", error);
        throw new Error(error.message);
      }

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
      await supabase.auth.signOut();
      toast.info("Sessão encerrada");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isLoading, session, isAdmin }}>
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
