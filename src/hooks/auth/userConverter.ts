
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@/types";
import { isAdmin } from "./permissions";

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
  try {
    // Buscar informações do usuário na tabela usuarios
    const { data, error } = await supabase
      .from('usuarios')
      .select('*')
      .eq('email', supabaseUser.email)
      .single();

    if (error) {
      console.error('Erro ao buscar dados do usuário:', error);
      // Em caso de erro, retornar apenas os dados básicos do Supabase
      return {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        name: supabaseUser.user_metadata?.name || supabaseUser.email || 'Usuário',
        departments: [],
        isAdmin: false
      };
    }

    // Verificar o status de administrador do usuário
    const adminStatus = await isAdmin(supabaseUser.email || '');

    // Retornar o usuário com informações de ambas as fontes
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: data.nome || supabaseUser.user_metadata?.name || supabaseUser.email || 'Usuário',
      departments: data.setores_atribuidos || [],
      isAdmin: adminStatus
    };
  } catch (error) {
    console.error('Erro ao converter dados do usuário:', error);
    // Em caso de erro, retornar apenas os dados básicos do Supabase
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || '',
      name: supabaseUser.user_metadata?.name || supabaseUser.email || 'Usuário',
      departments: [],
      isAdmin: false
    };
  }
};
