
import { supabase } from "@/integrations/supabase/client";

export const adminEmails = [
  "admin@nottar.com.br",
  "maciel@nottar.com.br",
  "dante@nottar.com.br"
];

// Cache para armazenar resultados de verificação de administrador por email
const adminCheckCache: Record<string, { result: boolean; timestamp: number }> = {};
const CACHE_TIMEOUT = 5 * 60 * 1000; // 5 minutos em milissegundos

/**
 * Verifica se o usuário é administrador consultando o banco de dados
 * @param email Email do usuário
 * @returns Promise<boolean> indicando se o usuário é administrador
 */
export const isAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase();
  
  // Verificar primeiro a lista de emails de administradores hard-coded
  if (adminEmails.includes(normalizedEmail)) {
    return true;
  }

  // Verificar o cache antes de fazer a consulta ao banco de dados
  const now = Date.now();
  const cachedResult = adminCheckCache[normalizedEmail];
  if (cachedResult && now - cachedResult.timestamp < CACHE_TIMEOUT) {
    console.log(`Usando resultado em cache para: ${email}`);
    return cachedResult.result;
  }

  console.log(`Buscando permissões no banco de dados para: ${email}`);
  
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('is_admin')
      .eq('email', normalizedEmail)
      .single();

    if (error) {
      console.error('Erro ao verificar permissões administrativas:', error);
      return false;
    }

    const isAdminUser = !!data?.is_admin;
    
    // Armazenar o resultado no cache
    adminCheckCache[normalizedEmail] = {
      result: isAdminUser,
      timestamp: now
    };

    console.log(`Usuário é administrador pelo perfil na tabela: ${isAdminUser}`);
    
    return isAdminUser;
  } catch (error) {
    console.error('Erro ao verificar permissões administrativas:', error);
    return false;
  }
};

/**
 * Versão síncrona da verificação de administrador, usando o cache
 * @param email Email do usuário
 * @returns boolean | null - true se o usuário for admin, false se não for, null se não houver dados no cache
 */
export const isAdminSync = (email: string): boolean | null => {
  if (!email) return false;
  
  const normalizedEmail = email.toLowerCase();
  
  // Verificar primeiro a lista de emails de administradores hard-coded
  if (adminEmails.includes(normalizedEmail)) {
    return true;
  }

  // Verificar o cache
  const now = Date.now();
  const cachedResult = adminCheckCache[normalizedEmail];
  
  if (cachedResult && now - cachedResult.timestamp < CACHE_TIMEOUT) {
    return cachedResult.result;
  }
  
  // Se não houver dados no cache, retornar null
  return null;
};
