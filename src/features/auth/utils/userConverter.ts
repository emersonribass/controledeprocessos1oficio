
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

    // Construir o objeto UserData com os dados do Supabase
    const userData: UserData = {
      id: user.id,
      email: user.email || "",
      name: data.nome || "",
      profile: data.perfil || "usuario",
      isAdmin: data.perfil === "admin",
      departments: data.setores_atribuidos || [],
    };

    return userData;
  } catch (error) {
    console.error("Erro ao converter usuário:", error);
    
    // Retornar dados básicos do usuário em caso de erro
    return {
      id: user.id,
      email: user.email || "",
      name: "",
      profile: "usuario",
      isAdmin: false,
      departments: [],
    };
  }
};
