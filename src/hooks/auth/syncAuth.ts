
// Esta função é usada para sincronizar dados entre o usuário na tabela usuarios e o auth
import { supabase } from "@/integrations/supabase/client";

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log("[syncAuth] Iniciando sincronização com autenticação para:", email);
    
    // Verificar se o usuário já existe na tabela auth.users
    const { data: existeData, error: existeError } = await supabase.rpc('migrate_usuario_to_auth', {
      usuario_email: email, 
      usuario_senha: password
    });
    
    console.log("[syncAuth] Verificação de existência via RPC:", existeData ? "existe" : "não existe");
    
    if (existeError) {
      console.error('[syncAuth] Erro na sincronização com autenticação:', existeError);
      return false;
    }
    
    // Se o usuário já existe, apenas sincronize os IDs
    const { data: syncData, error: syncError } = await supabase.rpc('sync_user_ids', {
      usuario_email: email
    });
    
    if (syncError) {
      console.error('[syncAuth] Erro ao sincronizar IDs:', syncError);
      return false;
    }
    
    console.log("[syncAuth] Sincronização de IDs concluída com sucesso");
    return true;
  } catch (error) {
    console.error('[syncAuth] Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
