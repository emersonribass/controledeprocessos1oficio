
// Lista de emails de administradores
import { supabase } from "@/integrations/supabase/client";

// Lista expandida de emails administrativos para garantir acesso
export const adminEmails = ["emerson.ribas@live.com", "emerson@nottar.com.br"];

// Cache aprimorado para armazenar resultados de verificações administrativas
const adminStatusCache: Record<string, {
  status: boolean;
  timestamp: number;
}> = {};

// Tempo de expiração do cache em milissegundos (30 minutos)
const CACHE_EXPIRATION = 30 * 60 * 1000;

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

// Versão sincronizada que não faz chamadas ao banco se já tivermos a resposta no cache
export const isAdminSync = (email: string): boolean | null => {
  if (!email) return false;
  
  // Verificar se existe no cache e se não está expirado
  const now = Date.now();
  if (adminStatusCache[email] && (now - adminStatusCache[email].timestamp < CACHE_EXPIRATION)) {
    return adminStatusCache[email].status;
  }
  
  // Verificar lista fixa de administradores sem consulta ao banco
  if (isAdminByEmail(email)) {
    // Armazenar no cache
    adminStatusCache[email] = { status: true, timestamp: now };
    return true;
  }
  
  // Se não está no cache e não é admin pela lista fixa, retorna null para indicar
  // que precisamos de verificação no banco de dados
  return null;
};

// Função para verificar se um usuário é administrador
// Verifica tanto a lista fixa quanto o perfil do usuário na tabela
export const isAdmin = async (email: string): Promise<boolean> => {
  if (!email) return false;
  
  // Primeiro, tentar obter do cache ou verificações sincronizadas
  const cachedResult = isAdminSync(email);
  if (cachedResult !== null) {
    return cachedResult;
  }
  
  const now = Date.now();
  
  // Se chegou aqui, precisamos verificar no banco de dados
  try {
    const { data, error } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('email', email)
      .single();

    if (error) {
      adminStatusCache[email] = { status: false, timestamp: now };
      return false;
    }

    const isAdminUser = data?.perfil === 'administrador';
    
    // Armazenar no cache
    adminStatusCache[email] = { status: isAdminUser, timestamp: now };
    
    // Limpar entradas expiradas do cache periodicamente
    cleanExpiredCache();
    
    return isAdminUser;
  } catch (error) {
    // Em caso de erro, cachear como não administrador para evitar consultas repetidas
    adminStatusCache[email] = { status: false, timestamp: now };
    return false;
  }
};
