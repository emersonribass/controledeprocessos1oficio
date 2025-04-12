
// Esta função é usada para sincronizar dados entre o usuário na tabela usuarios e o auth
import { supabase } from "@/integrations/supabase/client";

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    // Chama a função de migração no Supabase
    const { data, error } = await supabase.rpc('migrate_usuario_to_auth', {
      usuario_email: email, 
      usuario_senha: password
    });
    
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
