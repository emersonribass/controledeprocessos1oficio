
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

export const isAdminByEmail = async (email: string): Promise<boolean> => {
  try {
    if (!email) return false;
    
    const lowerEmail = email.toLowerCase();
    console.log("Verificando se usuário é admin:", lowerEmail);
    
    // Verificar no cache primeiro
    const now = Date.now();
    const cachedValue = adminCache[lowerEmail];
    
    if (cachedValue && (now - cachedValue.timestamp < CACHE_EXPIRY_MS)) {
      console.log("Usando resultado em cache para admin:", lowerEmail, cachedValue.isAdmin);
      return cachedValue.isAdmin;
    }
    
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
    
    // Buscar no banco de dados
    const { data, error } = await supabase
      .from("usuarios")
      .select("perfil")
      .eq("email", lowerEmail)
      .single();

    if (error) {
      console.error("Erro ao verificar se usuário é admin no banco:", error);
      return false;
    }

    const isAdmin = data?.perfil === "admin";
    console.log("Resultado da verificação no banco para admin:", lowerEmail, isAdmin);
    
    // Atualizar o cache
    adminCache[lowerEmail] = {
      isAdmin,
      timestamp: now
    };

    return isAdmin;
  } catch (error) {
    console.error("Erro ao verificar se usuário é admin:", error);
    return false;
  }
};
