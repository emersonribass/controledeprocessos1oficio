
/**
 * Módulo responsável por sincronizar usuários entre tabela 'usuarios' e sistema de autenticação
 * Garante a consistência entre IDs de usuários nas duas tabelas
 */
import { supabase } from "@/integrations/supabase/client";

/**
 * Sincroniza um usuário entre a tabela 'usuarios' e o sistema de autenticação do Supabase
 * - Se o usuário já existir no auth, sincroniza os IDs
 * - Se não existir, cria um novo usuário no auth e sincroniza o ID
 * 
 * @param email Email do usuário a ser sincronizado
 * @param password Senha do usuário (necessária apenas para criação)
 * @returns ID do usuário (string) em caso de sucesso, ou false em caso de erro
 */
export const syncAuthWithUsuarios = async (email: string, password: string): Promise<string | boolean> => {
  try {
    console.log("[syncAuth] Iniciando sincronização com autenticação para:", email);
    
    // Verificar se o usuário já existe no auth.users através da função RPC
    let userExists = false;
    
    try {
      // Tentamos primeiro verificar se o usuário existe no auth usando a verificação direta
      const { data: authUserData, error: authCheckError } = await supabase.auth.admin
        .getUserByEmail(email)
        .catch(() => ({ data: null, error: null }));
      
      if (!authCheckError && authUserData) {
        console.log("[syncAuth] Usuário encontrado no auth pela verificação direta");
        userExists = true;
      } else {
        // Se não conseguimos acessar a API admin, tentamos a função RPC
        try {
          const { data: existingAuthUser } = await supabase.rpc('sync_user_ids', {
            usuario_email: email
          });
          
          // Se a função não lançou erro, assume que o usuário existe
          userExists = !!existingAuthUser;
          console.log("[syncAuth] Verificação de existência via RPC:", userExists ? "existe" : "não existe");
        } catch (rpcError) {
          console.log("[syncAuth] Erro ao verificar via RPC, assumindo que usuário não existe");
          userExists = false;
        }
      }
    } catch (verifyError) {
      console.warn("[syncAuth] Erro ao verificar existência do usuário:", verifyError);
      // Em caso de erro na verificação, vamos assumir que o usuário não existe
      // e deixar a operação de criação lidar com isso
      userExists = false;
    }
    
    // Sincronizar usuário com base na verificação
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
      
      console.log("[syncAuth] Sincronização de IDs concluída com sucesso");
      
      // Buscar o ID do usuário na tabela de usuários
      const { data: userData, error: userError } = await supabase
        .from('usuarios')
        .select('id')
        .eq('email', email)
        .single();
      
      if (userError || !userData) {
        console.error('[syncAuth] Erro ao obter ID do usuário após sincronização:', userError);
        return false;
      }
      
      return userData.id;
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return migrateData;
  } catch (error) {
    console.error('[syncAuth] Erro não tratado ao sincronizar com autenticação:', error);
    return false;
  }
};
