
import { supabase } from "@/integrations/supabase/client";

// Interface para definir os tipos de parâmetros da função RPC
interface MigrateUsuarioParams {
  usuario_email: string;
  usuario_senha: string;
}

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    // Chama a função de migração no Supabase com tipagem correta
    const { data, error } = await supabase.rpc<any>('migrate_usuario_to_auth', {
      usuario_email: email, 
      usuario_senha: password
    } as MigrateUsuarioParams);
    
    if (error) {
      console.error('Erro na sincronização com autenticação:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
