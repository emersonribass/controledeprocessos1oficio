
import { User as SupabaseUser } from "@supabase/supabase-js";
import { User } from "@/types";
import { supabase } from "@/integrations/supabase/client";

// Função para converter usuário do Supabase para nosso tipo User
export const convertSupabaseUser = async (supabaseUser: SupabaseUser | null): Promise<User | null> => {
  if (!supabaseUser) return null;
  
  console.log("Convertendo usuário do Supabase:", supabaseUser.email);
  
  try {
    // Buscar informações adicionais do usuário na tabela usuarios
    const { data: userData, error: userError } = await supabase
      .from('usuarios')
      .select('setores_atribuidos, perfil, nome')
      .eq('email', supabaseUser.email)
      .maybeSingle();
    
    if (userError && userError.code !== 'PGRST116') { // PGRST116 é "não encontrado"
      console.error('Erro ao buscar dados do usuário na tabela usuarios:', userError);
    }
    
    // Se não encontrar o usuário na tabela usuarios, criar um registro a partir dos dados do auth.users
    if (!userData) {
      console.log("Criando novo registro de usuário na tabela 'usuarios' a partir do auth.users");
      
      const displayName = supabaseUser.user_metadata?.nome || 
                          supabaseUser.user_metadata?.full_name || 
                          supabaseUser.email?.split('@')[0] || 
                          "Usuário";
      
      // Criar um usuário na tabela usuarios com os dados básicos
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: supabaseUser.id,
          nome: displayName,
          email: supabaseUser.email || "",
          senha: "***autenticado-pelo-supabase***", // Indicação que a senha é gerenciada pelo Supabase
          ativo: true,
          perfil: 'usuario', // Perfil padrão
          setores_atribuidos: []
        });
      
      if (insertError) {
        console.error('Erro ao criar usuário na tabela usuarios:', insertError);
      } else {
        console.log("Usuário criado com sucesso na tabela usuarios");
        
        // Buscar os dados do usuário recém-criado
        const { data: newUserData } = await supabase
          .from('usuarios')
          .select('setores_atribuidos, perfil, nome')
          .eq('id', supabaseUser.id)
          .maybeSingle();
          
        if (newUserData) {
          return {
            id: supabaseUser.id,
            email: supabaseUser.email || "",
            name: newUserData.nome,
            departments: newUserData.setores_atribuidos || [],
            createdAt: supabaseUser.created_at,
          };
        }
      }
    }
    
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: userData?.nome || supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || "Usuário",
      departments: userData?.setores_atribuidos || [],
      createdAt: supabaseUser.created_at,
    };
  } catch (error) {
    console.error("Erro ao converter usuário:", error);
    // Retornar um usuário básico em caso de erro
    return {
      id: supabaseUser.id,
      email: supabaseUser.email || "",
      name: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || "Usuário",
      departments: [],
      createdAt: supabaseUser.created_at,
    };
  }
};
