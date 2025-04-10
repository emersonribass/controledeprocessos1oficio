
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
    // Criar o usuário base com os dados obrigatórios
    const baseUser: User = {
      id: authUser.id,
      email: authUser.email || '',
      name: authUser.user_metadata?.name || authUser.email || '',
      departments: [], // Valor padrão vazio para departamentos
      createdAt: new Date().toISOString() // Data atual como padrão
    };
    
    // Verificar se o usuário existe na tabela customizada
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('*')
      .eq('id', authUser.id)
      .maybeSingle();
      
    // Se encontrado na tabela de usuários, complementar as informações
    if (!usuarioError && usuarioData) {
      console.log('[userConverter] Encontrado usuário na tabela usuarios:', usuarioData.nome);
      
      // Atualizar nome se disponível na tabela de usuários
      baseUser.name = usuarioData.nome;
      
      // Mapear setores atribuídos para departments
      baseUser.departments = usuarioData.setores_atribuidos || [];
      
      // Se houver data de criação, usar ela
      if (usuarioData.created_at) {
        baseUser.createdAt = usuarioData.created_at;
      }
    } else {
      if (usuarioError && usuarioError.code !== 'PGRST116') { // PGRST116: objeto não encontrado
        console.error('[userConverter] Erro ao buscar usuário na tabela usuarios:', usuarioError);
      } else {
        console.log('[userConverter] Usuário não encontrado na tabela usuarios');
      }
    }
    
    return baseUser;
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
