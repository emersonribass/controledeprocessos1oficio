
// Lista de emails de administradores
import { supabase } from "@/integrations/supabase/client";

export const adminEmails = ["emerson.ribas@live.com"];

// Função para verificar se um email pertence a um administrador da lista fixa
export const isAdminByEmail = (email: string): boolean => {
  return adminEmails.includes(email);
};

// Função para verificar se um usuário é administrador
// Verifica tanto a lista fixa quanto o perfil do usuário na tabela 'usuarios'
export const isAdmin = async (userId: string): Promise<boolean> => {
  try {
    // Verificar o perfil na tabela de usuários
    const { data, error } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Erro ao verificar perfil do usuário:', error);
      return false;
    }

    return data?.perfil === 'administrador';
  } catch (error) {
    console.error('Erro ao verificar se usuário é administrador:', error);
    return false;
  }
};
