
import { supabase } from "@/integrations/supabase/client";

// Função para sincronizar usuário com a tabela usuarios
export const syncAuthWithUsuarios = async (email: string, senha: string): Promise<boolean> => {
  try {
    // Chamar a função SQL que criamos para migrar o usuário para auth.users
    const { data, error } = await supabase.rpc(
      'migrate_usuario_to_auth', 
      { 
        usuario_email: email, 
        usuario_senha: senha 
      }
    );

    if (error) {
      console.error('Erro ao sincronizar usuário:', error);
      return false;
    }

    // Atualizar status de sincronização na tabela usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ auth_sincronizado: true })
      .eq('email', email);

    if (updateError) {
      console.error('Erro ao atualizar status de sincronização:', updateError);
    }

    return true;
  } catch (error) {
    console.error('Exceção ao sincronizar usuário:', error);
    return false;
  }
};
