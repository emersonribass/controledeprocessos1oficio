
// Esta função é usada para sincronizar dados entre o usuário na tabela usuarios e o auth
import { supabase } from "@/integrations/supabase/client";

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    console.log("[syncAuth] Iniciando sincronização com autenticação para:", email);
    
    // Verificar se o usuário já existe no auth.users
    const { data, error: authCheckError } = await supabase.auth.getUser()
      .catch(e => {
        console.log("[syncAuth] Erro ao verificar usuário no auth:", e);
        return { data: null, error: e };
      });
    
    if (authCheckError) {
      console.log("[syncAuth] Erro ao verificar se usuário existe no auth:", authCheckError);
    }
    
    // Verificar se há um usuário autenticado
    const authUser = data?.user;
    
    if (authUser) {
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
      return true;
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
    
    return true;
  } catch (error) {
    console.error('[syncAuth] Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
