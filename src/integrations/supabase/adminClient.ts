
import { supabase } from './client';

// Estender o cliente do Supabase com métodos de admin simulados
export const supabaseAdmin = {
  ...supabase,
  auth: {
    ...supabase.auth,
    admin: {
      listUsers: async ({ filter = {} } = {}) => {
        try {
          const { data, error } = await supabase.rpc('admin_list_users', { filter });
          
          if (error) throw error;
          
          return { 
            data: { 
              users: data || [],
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
          const { data, error } = await supabase.rpc('admin_delete_user', { user_id: userId });
          
          if (error) throw error;
          
          return { data, error: null };
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
