
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Helper function to convert Supabase user to our User type
export const convertSupabaseUser = (supabaseUser: SupabaseUser | null): User | null => {
  if (!supabaseUser) return null;
  
  return {
    id: supabaseUser.id,
    email: supabaseUser.email || "",
    name: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || "Usuário",
    departments: [],
    createdAt: supabaseUser.created_at,
  };
};

// Função melhorada para sincronizar usuário com a tabela usuarios
export const syncAuthWithUsuarios = async (email: string, senha: string, forceRecreate: boolean = false): Promise<boolean> => {
  try {
    console.log("Tentando sincronizar usuário:", email);
    
    if (forceRecreate) {
      // Verificar se o usuário existe no auth e remover se necessário
      try {
        const { data: usuarioData } = await supabase.from('usuarios')
          .select('*')
          .eq('email', email)
          .maybeSingle();
          
        if (usuarioData) {
          // Tentar usar a função RPC para sincronizar usuários
          await supabase.rpc('sync_user_ids', { usuario_email: email });
        }
      } catch (e) {
        console.error("Erro ao verificar/deletar usuário:", e);
      }
    }
    
    // Tentar migração completa do usuário
    console.log("Tentando migração completa do usuário");
    const { data, error } = await supabase.rpc('migrate_usuario_to_auth', { 
      usuario_email: email, 
      usuario_senha: senha 
    });

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    console.log("Migração concluída com sucesso:", data);
    
    // Aguardar um momento para garantir que as alterações foram processadas
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return true;
  } catch (error) {
    console.error('Exceção ao sincronizar usuário:', error);
    return false;
  }
};
