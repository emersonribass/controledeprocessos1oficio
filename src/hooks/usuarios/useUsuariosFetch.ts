
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { UsuarioSupabase } from "@/types/usuario";

export function useUsuariosFetch() {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("nome");

      if (error) {
        throw error;
      }

      setUsuarios(data as UsuarioSupabase[]);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast.error("Não foi possível carregar a lista de usuários.");
    } finally {
      setIsLoading(false);
    }
  };

  return {
    usuarios,
    isLoading,
    fetchUsuarios
  };
}
