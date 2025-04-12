
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Função para converter usuário do Supabase para nosso tipo User
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
