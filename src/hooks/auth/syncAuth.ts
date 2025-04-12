
import { supabase } from "@/integrations/supabase/client";

/**
 * Interface para definir os tipos de parâmetros da função RPC
 */
interface MigrateUsuarioParams {
  usuario_email: string;
  usuario_senha: string;
}

/**
 * Interface para a resposta esperada da função RPC
 */
interface MigrateUsuarioResponse {
  success: boolean;
  message?: string;
}

/**
 * Função para sincronizar usuário da tabela usuarios com o auth.users do Supabase
 */
export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    // Corrigindo a tipagem da chamada RPC para resolver o erro TS2345
    const { data, error } = await supabase.rpc<MigrateUsuarioResponse, MigrateUsuarioParams>(
      'migrate_usuario_to_auth',
      {
        usuario_email: email, 
        usuario_senha: password
      }
    );
    
    if (error) {
      console.error('Erro na sincronização com autenticação:', error);
      return false;
    }
    
    console.log('Sincronização bem-sucedida:', data);
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
