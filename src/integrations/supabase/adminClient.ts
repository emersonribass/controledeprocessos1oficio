
import { supabase } from './client';

// Estender o cliente do Supabase com métodos de admin simulados
export const supabaseAdmin = {
  ...supabase,
  auth: {
    ...supabase.auth,
    admin: {
      listUsers: async () => {
        try {
          // Usar função RPC existente ou fazer uma consulta direta na tabela usuarios
          const { data, error } = await supabase
            .from('usuarios')
            .select('id, email, created_at, nome, ativo, setores_atribuidos, perfil')
            .order('created_at', { ascending: false });
          
          if (error) throw error;
          
          // Transformar o resultado para corresponder ao formato esperado
          const users = data?.map(user => ({
            id: user.id,
            email: user.email,
            created_at: user.created_at,
            last_sign_in_at: null,
            raw_user_meta_data: {
              nome: user.nome,
              ativo: user.ativo,
              setores_atribuidos: user.setores_atribuidos,
              perfil: user.perfil
            }
          })) || [];
          
          return { 
            data: { 
              users: users,
              aud: 'authenticated'
            }, 
            error: null 
          };
        } catch (error) {
          console.error("Erro ao listar usuários:", error);
          return { data: null, error };
        }
      },
      
      deleteUser: async (userId: string) => {
        try {
          // Excluir o usuário da tabela usuarios
          const { data, error } = await supabase
            .from('usuarios')
            .delete()
            .eq('id', userId);
          
          if (error) throw error;
          
          return { data: true, error: null };
        } catch (error) {
          console.error("Erro ao deletar usuário:", error);
          return { data: null, error };
        }
      }
    }
  }
};

// Aplicar o cliente admin ao cliente supabase existente
Object.defineProperty(supabase.auth, 'admin', {
  get: () => supabaseAdmin.auth.admin
});
