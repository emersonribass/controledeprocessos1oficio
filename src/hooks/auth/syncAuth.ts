
import { supabase } from "@/integrations/supabase/client";

// Interface para definir os tipos de parâmetros da função RPC
interface MigrateUsuarioParams {
  usuario_email: string;
  usuario_senha: string;
}

// Interface para a resposta esperada da função RPC (ou use any se a resposta for desconhecida)
interface MigrateUsuarioResponse {
  success: boolean;
  // Adicione outras propriedades que a resposta possa ter
}

export const syncAuthWithUsuarios = async (email: string, password: string): Promise<boolean> => {
  try {
    // Chama a função de migração no Supabase com as tipagens corretas para os parâmetros e resposta
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
    
    return true;
  } catch (error) {
    console.error('Erro ao sincronizar com autenticação:', error);
    return false;
  }
};
