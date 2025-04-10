
// Lista de emails de administradores
import { supabase } from "@/integrations/supabase/client";

export const adminEmails = ["admin@nottar.com", "emerson.ribas@live.com", "werbster@1oficio.com.br"];

// Função para verificar se um email pertence a um administrador da lista fixa
export const isAdminByEmail = (email: string): boolean => {
  return adminEmails.includes(email);
};

// Função para verificar se um usuário é administrador
// Verifica tanto a lista fixa quanto o perfil do usuário na tabela
export const isAdmin = async (email: string): Promise<boolean> => {
  // Primeiro, verifica se o email está na lista fixa
  if (isAdminByEmail(email)) {
    return true;
  }
  
  // Se não estiver na lista fixa, verifica o perfil na tabela de usuários
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('email', email)
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
