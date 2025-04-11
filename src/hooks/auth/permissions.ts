
// Lista de emails de administradores
import { supabase } from "@/integrations/supabase/client";

// Lista expandida de emails administrativos para garantir acesso
export const adminEmails = ["emerson.ribas@live.com", "emerson@nottar.com.br"];

// Cache para armazenar resultados de verificações administrativas
const adminStatusCache: Record<string, {
  status: boolean;
  timestamp: number;
}> = {};

// Tempo de expiração do cache em milissegundos (5 minutos)
const CACHE_EXPIRATION = 5 * 60 * 1000;

// Função para verificar se um email pertence a um administrador da lista fixa
export const isAdminByEmail = (email: string): boolean => {
  return adminEmails.includes(email);
};

// Função para limpar entradas expiradas do cache
const cleanExpiredCache = () => {
  const now = Date.now();
  Object.keys(adminStatusCache).forEach(email => {
    if (now - adminStatusCache[email].timestamp > CACHE_EXPIRATION) {
      delete adminStatusCache[email];
    }
  });
};

// Função para verificar se um usuário é administrador
// Verifica tanto a lista fixa quanto o perfil do usuário na tabela
export const isAdmin = async (email: string): Promise<boolean> => {
  // Primeiro, verificar se existe no cache e se não está expirado
  const now = Date.now();
  if (adminStatusCache[email] && (now - adminStatusCache[email].timestamp < CACHE_EXPIRATION)) {
    console.log("Usando resultado em cache para:", email);
    return adminStatusCache[email].status;
  }
  
  console.log("Verificando permissões administrativas para:", email);
  
  // Primeiro, verifica se o email está na lista fixa
  if (isAdminByEmail(email)) {
    console.log("Usuário é administrador pela lista fixa");
    // Armazenar no cache
    adminStatusCache[email] = { status: true, timestamp: now };
    return true;
  }
  
  // Se não estiver na lista fixa, verifica o perfil na tabela de usuários
  try {
    console.log("Buscando permissões no banco de dados para:", email);
    const { data, error } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('email', email)
      .single();

    if (error) {
      console.error('Erro ao verificar perfil do usuário:', error);
      return false;
    }

    const isAdminUser = data?.perfil === 'administrador';
    console.log("Usuário é administrador pelo perfil na tabela:", isAdminUser);
    
    // Armazenar no cache
    adminStatusCache[email] = { status: isAdminUser, timestamp: now };
    
    // Limpar entradas expiradas do cache periodicamente
    cleanExpiredCache();
    
    return isAdminUser;
  } catch (error) {
    console.error('Erro ao verificar se usuário é administrador:', error);
    return false;
  }
};
