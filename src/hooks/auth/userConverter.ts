
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
    
    if (userError) {
      console.error('Erro ao buscar dados do usuário na tabela usuarios:', userError);
    }
    
    // Se não encontrar o usuário na tabela usuarios, tentar criar um registro a partir dos dados do auth.users
    if (!userData) {
      console.log("Usuário não encontrado na tabela 'usuarios', criando a partir do auth.users");
      
      // Criar um usuário na tabela usuarios com os dados básicos
      const { error: insertError } = await supabase
        .from('usuarios')
        .insert({
          id: supabaseUser.id,
          nome: supabaseUser.user_metadata?.nome || supabaseUser.user_metadata?.full_name || supabaseUser.email?.split('@')[0] || "Usuário",
          email: supabaseUser.email || "",
          senha: "senhaGeradaPeloAuth", // Valor temporário, não será usado para login
          ativo: true,
          perfil: 'usuario', // Perfil padrão
          setores_atribuidos: []
        });
      
      if (insertError) {
        console.error('Erro ao criar usuário na tabela usuarios:', insertError);
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
