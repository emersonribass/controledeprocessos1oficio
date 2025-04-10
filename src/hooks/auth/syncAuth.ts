
// Esta função é usada para sincronizar dados entre o usuário na tabela usuarios e o auth
import { supabase } from "@/integrations/supabase/client";

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<string | boolean> => {
  try {
    console.log("[syncAuth] Iniciando sincronização com autenticação para:", email);
    
    // Verificar se o usuário já existe no auth.users
    // Como não podemos acessar diretamente auth.users via API, vamos verificar de outra forma
    const { data: existingAuthUser, error: existingUserError } = await supabase.rpc('check_user_exists', {
      user_email: email
    }).maybeSingle();
    
    if (existingUserError) {
      console.log("[syncAuth] Erro ao verificar se usuário existe:", existingUserError);
      // Continuar mesmo com erro, pois a função RPC pode não existir
    }
    
    const userExists = existingAuthUser?.exists || false;
    
    // Verificar se há um usuário autenticado
    if (userExists) {
      console.log("[syncAuth] Usuário já existe no auth, sincronizando IDs");
      // Se o usuário já existe no auth, apenas sincronize os IDs
      const { data: syncData, error: syncError } = await supabase.rpc('sync_user_ids', {
        usuario_email: email
      });
      
      if (syncError) {
        console.error('[syncAuth] Erro na sincronização de IDs:', syncError);
        return false;
      }
      
      console.log("[syncAuth] Sincronização de IDs concluída:", syncData);
      return syncData;
    }
    
    // Se não existir, chama a função de migração no Supabase
    console.log("[syncAuth] Usuário não encontrado no auth, criando novo...");
    const { data: migrateData, error } = await supabase.rpc('migrate_usuario_to_auth', {
      usuario_email: email, 
      usuario_senha: password
    });
    
    if (error) {
      console.error('[syncAuth] Erro na sincronização com autenticação:', error);
      return false;
    }
    
    console.log("[syncAuth] Sincronização com autenticação concluída com sucesso:", migrateData);
    
    // Aguardar um momento para garantir que a autenticação seja processada
    await new Promise(resolve => setTimeout(resolve, 800));
    
    return migrateData;
  } catch (error) {
    console.error('[syncAuth] Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
