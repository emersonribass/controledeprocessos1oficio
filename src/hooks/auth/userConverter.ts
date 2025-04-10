
import { AuthUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export const convertSupabaseUser = async (authUser: AuthUser): Promise<User> => {
  try {
    // Verificar se o usuário existe na tabela customizada
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
      
    // Usuário básico com dados do auth
    const user: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email || ''
    };
    
    // Se encontrado na tabela de usuários, complementar as informações
    if (!usuarioError && usuarioData) {
      user.name = usuarioData.nome;
      user.role = usuarioData.perfil === 'administrador' ? 'admin' : 'user';
      user.departments = usuarioData.setores_atribuidos;
      user.isActive = usuarioData.ativo;
    } else {
      console.log('[userConverter] Usuário não encontrado na tabela usuarios ou erro:', usuarioError);
    }
    
    return user;
  } catch (error) {
    console.error('[userConverter] Erro ao converter usuário:', error);
    // Retornar ao menos os dados básicos disponíveis no auth
    return {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email || ''
    };
  }
};
