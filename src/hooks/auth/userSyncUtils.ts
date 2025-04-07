
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert Supabase user to our User type
export const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || "Usuário",
    departments: [],
    createdAt: supabaseUser.created_at,
  };
};

// Função melhorada para sincronizar usuário com a tabela usuarios
export const syncAuthWithUsuarios = async (email: string, senha: string): Promise<boolean> => {
  try {
    console.log("Tentando sincronizar usuário:", email);
    
    // Verificar se o usuário existe na tabela auth.users mas com metadados incorretos
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password: senha
    });
    
    if (authData?.user && !authError) {
      console.log("Autenticação realizada com sucesso, verificando metadados");
      // Usuário existe e senha está correta, mas pode ter metadados incorretos
      // Vamos sincronizar os IDs
      const { data, error } = await supabase.rpc(
        'sync_user_ids' as any, 
        { usuario_email: email } as any
      );
      
      if (!error && data === true) {
        console.log("IDs sincronizados com sucesso");
        return true;
      }
    }
    
    // Se a autenticação falhou ou a sincronização de IDs falhou, tentar migração completa
    console.log("Tentando migração completa do usuário");
    const { data, error } = await supabase.rpc('migrate_usuario_to_auth', { 
      usuario_email: email, 
      usuario_senha: senha 
    });

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    console.log("Migração concluída com sucesso:", data);
    return true;
  } catch (error) {
    console.error('Exceção ao sincronizar usuário:', error);
    return false;
  }
};
