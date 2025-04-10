
/**
 * Módulo para conversão de dados entre usuário do Supabase Auth e formato interno da aplicação
 */
import { AuthUser } from '@supabase/supabase-js';
import { User } from '@/types';
import { supabase } from '@/integrations/supabase/client';

/**
 * Converte um usuário do Supabase Auth para o formato de usuário da aplicação
 * 
 * @param authUser Usuário do Supabase Auth
 * @returns Objeto de usuário no formato da aplicação
 */
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
      name: authUser.user_metadata?.name || authUser.email || '',
      departments: [], // Valor padrão vazio para departamentos
      createdAt: new Date().toISOString() // Data atual como padrão
    };
    
    // Se encontrado na tabela de usuários, complementar as informações
    if (!usuarioError && usuarioData) {
      user.name = usuarioData.nome;
      
      // Mapear perfil para o campo role do User, se existir na interface
      if (usuarioData.perfil === 'administrador') {
        user.role = 'admin';
      } else {
        user.role = 'user';
      }
      
      // Mapear setores atribuídos para departments
      user.departments = usuarioData.setores_atribuidos || [];
      
      // Mapear campo ativo para isActive se existir na interface
      user.isActive = usuarioData.ativo;
      
      // Se houver data de criação, usar ela
      if (usuarioData.created_at) {
        user.createdAt = usuarioData.created_at;
      }
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
      name: authUser.user_metadata?.name || authUser.email || '',
      departments: [],
      createdAt: new Date().toISOString()
    };
  }
};
