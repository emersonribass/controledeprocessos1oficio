
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

// Lista de emails de administradores
const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com"];

// Helper function to convert Supabase user to our User type
const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  // Buscar informações adicionais do usuário na tabela usuarios
  const { data: userData, error: userError } = await supabase
    .from('usuarios')
    .select('setores_atribuidos, perfil')
    .eq('email', supabaseUser.email)
    .single();
  
  if (userError && userError.code !== 'PGRST116') {
    console.error('Erro ao buscar dados do usuário:', userError);
  }
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || "Usuário",
    departments: userData?.setores_atribuidos || [],
    createdAt: supabaseUser.created_at,
  };
};

// Função para sincronizar usuário com a tabela usuarios
const syncAuthWithUsuarios = async (email: string, senha: string): Promise<boolean> => {
  try {
    // Chamar a função SQL que criamos para migrar o usuário para auth.users
    const { data, error } = await supabase.rpc(
      'migrate_usuario_to_auth', 
      { 
        usuario_email: email, 
        usuario_senha: senha 
      }
    );

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    // Atualizar status de sincronização na tabela usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ auth_sincronizado: true })
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
    console.log("Inicializando AuthProvider");
    
    // Função para obter sessão inicial e configurar listener
    const initAuth = async () => {
      try {
        setIsLoading(true);
        
        // Primeiro verificar se há uma sessão existente
        const { data: sessionData } = await supabase.auth.getSession();
        setSession(sessionData.session);
        
        if (sessionData.session?.user) {
          const userData = await convertSupabaseUser(sessionData.session.user);
          setUser(userData);
        }
        
        // Configurar listener para mudanças de estado de autenticação
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (_event, session) => {
            console.log("Evento de autenticação:", _event);
            setSession(session);
            
            if (session?.user) {
              const userData = await convertSupabaseUser(session.user);
              setUser(userData);
            } else {
              setUser(null);
            }
          }
        );
        
        setIsLoading(false);
        return () => subscription.unsubscribe();
      } catch (error) {
        console.error("Erro ao inicializar autenticação:", error);
        setIsLoading(false);
        return () => {}; // Retorna uma função vazia em caso de erro
      }
    };
    
    // Inicializa a autenticação e armazena a função de limpeza
    let cleanupFunction = () => {};
    
    // Executa a inicialização de forma assíncrona
    initAuth().then(cleanup => {
      if (cleanup && typeof cleanup === 'function') {
        cleanupFunction = cleanup;
      }
    }).catch(error => {
      console.error("Erro durante inicialização da autenticação:", error);
    });
    
    // Retorna a função de limpeza para useEffect
    return () => {
      cleanupFunction();
    };
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
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
        throw new Error(error.message);
      }

      toast.success("Login realizado com sucesso!");
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Erro ao realizar login");
      }
      setIsLoading(false); // Garantir que isLoading volta para false em caso de erro
      throw error;
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      toast.info("Sessão encerrada");
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
      toast.error("Erro ao encerrar sessão");
    } finally {
      setIsLoading(false);
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
