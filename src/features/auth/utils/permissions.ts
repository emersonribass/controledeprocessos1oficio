
import { supabase } from "@/integrations/supabase/client";

// Lista de emails de administradores padrão
const defaultAdminEmails = [
  "admin@nottar.com", 
  "emerson.ribas@live.com",
  "emerson@nottar.com.br"
];

// Cache para reduzir chamadas ao banco de dados
interface AdminCache {
  [email: string]: {
    isAdmin: boolean;
    timestamp: number;
  };
}

// Tempo de expiração do cache: 5 minutos
const CACHE_EXPIRY_MS = 5 * 60 * 1000;

// Cache local para manter os resultados das verificações
const adminCache: AdminCache = {};

export const isAdmin = async (email: string): Promise<boolean> => {
  try {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    
    // Verificar no cache primeiro
    const now = Date.now();
    const cachedValue = adminCache[lowerEmail];
    
    if (cachedValue && (now - cachedValue.timestamp < CACHE_EXPIRY_MS)) {
      console.log("Usando resultado em cache para:", lowerEmail);
      return cachedValue.isAdmin;
    }

    console.log("Buscando permissões no banco de dados para:", lowerEmail);

    // Verificar se é um dos emails padrão de admin
    if (defaultAdminEmails.includes(lowerEmail)) {
      console.log("Email na lista de admins padrão:", lowerEmail);
      // Atualizar o cache
      adminCache[lowerEmail] = {
        isAdmin: true,
        timestamp: now
      };
      return true;
    }

    // Verificar no banco de dados
    const { data, error } = await supabase
      .from('usuarios')
      .select('perfil')
      .eq('email', lowerEmail)
      .single();
    
    if (error) {
      console.error("Erro ao buscar perfil do usuário:", error);
      return false;
    }
    
    // Verificar se o perfil é 'admin'
    const isUserAdmin = data?.perfil === 'admin';
    console.log(`Usuário é administrador pelo perfil na tabela: ${isUserAdmin}`);
    
    // Atualizar o cache
    adminCache[lowerEmail] = {
      isAdmin: isUserAdmin,
      timestamp: now
    };
    
    return isUserAdmin;
  } catch (error) {
    console.error(`Erro ao verificar status de administrador para ${email}:`, error);
    return false;
  }
};

/**
 * Versão síncrona para verificar se um email está na lista de administradores
 * Útil para componentes React que não podem esperar por uma promise
 * 
 * @param email Email a ser verificado
 * @returns boolean indicando se o email está na lista de admins
 */
export const isAdminSync = (email: string): boolean => {
  if (!email) return false;
  
  const lowerEmail = email.toLowerCase();
  
  // Verificar no cache primeiro
  const now = Date.now();
  const cachedValue = adminCache[lowerEmail];
  
  if (cachedValue && (now - cachedValue.timestamp < CACHE_EXPIRY_MS)) {
    return cachedValue.isAdmin;
  }
  
  // Se não estiver no cache, verifica apenas na lista padrão de emails
  return defaultAdminEmails.includes(lowerEmail);
};
