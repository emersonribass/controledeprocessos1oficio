
import { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { UserData } from "../types";

export const convertSupabaseUser = async (user: User): Promise<UserData> => {
  try {
    // Buscar dados adicionais do usuário na tabela usuarios
    const { data, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("id", user.id)
      .single();

    if (error) {
      console.error("Erro ao buscar dados do usuário:", error);
      throw error;
    }

    // Verificar se o perfil é de administrador
    const isAdmin = data.perfil === "admin";

    // Construir o objeto UserData com os dados do Supabase
    const userData: UserData = {
      id: user.id,
      email: user.email || "",
      nome: data.nome || "",
      name: data.nome || "", // Para compatibilidade
      perfil: data.perfil || "usuario",
      profile: data.perfil || "usuario", // Para compatibilidade
      ativo: data.ativo,
      setores_atribuidos: data.setores_atribuidos || [],
      departments: data.setores_atribuidos || [], // Para compatibilidade
      isAdmin: isAdmin
    };

    return userData;
  } catch (error) {
    console.error("Erro ao converter usuário:", error);
    
    // Retornar dados básicos do usuário em caso de erro
    return {
      id: user.id,
      email: user.email || "",
      nome: "",
      name: "",
      perfil: "usuario",
      profile: "usuario",
      ativo: true,
      setores_atribuidos: [],
      departments: [],
      isAdmin: false
    };
  }
};
