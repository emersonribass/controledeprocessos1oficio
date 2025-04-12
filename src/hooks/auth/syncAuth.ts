
import { supabase } from "@/integrations/supabase/client";

// Interface para definir os tipos de parâmetros da função RPC
interface MigrateUsuarioParams {
  usuario_email: string;
  usuario_senha: string;
}

// Interface para a resposta esperada da função RPC
interface MigrateUsuarioResponse {
  success: boolean;
  // Adicione outras propriedades que a resposta possa ter
}

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    // Usamos uma abordagem com tipagem adequada para o método rpc
    const { data, error } = await supabase.rpc<MigrateUsuarioResponse>(
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
    
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
