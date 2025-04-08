
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";
import { adminEmails } from "./types";

// Helper function to convert Supabase user to our User type
export const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
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

// Função para verificar se um email pertence a um administrador
export const isAdmin = (email: string): boolean => {
  return adminEmails.includes(email);
};

// Função para sincronizar usuário com a tabela usuarios
export const syncAuthWithUsuarios = async (email: string, senha: string): Promise<boolean> => {
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
