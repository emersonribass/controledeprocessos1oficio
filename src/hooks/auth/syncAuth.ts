
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { UsuarioSupabase } from "@/types/usuario";
import { useToast } from "../use-toast";

/**
 * Hook para sincronizar a autenticação do Supabase com o banco de dados de usuários.
 * Garante que cada usuário autenticado no Supabase tenha um registro correspondente
 * na tabela de usuários, sincronizando informações como nome e email.
 */
export const syncAuth = async (userDetails: UsuarioSupabase) => {
  const { toast } = useToast();

  // Função para migrar ou criar um usuário no banco de dados
  const migrateOrCreateUsuario = async (
    userDetails: UsuarioSupabase
  ): Promise<{ success: boolean; usuario: UsuarioSupabase }> => {
    try {
      // Verificar se o usuário já existe pelo ID
      const { data: existingUser, error: selectError } = await supabase
        .from("usuarios")
        .select("*")
        .eq("id", userDetails.id)
        .single();

      if (selectError && selectError.code !== "PGRST116") {
        console.error("Erro ao buscar usuário existente:", selectError);
        throw selectError;
      }

      if (existingUser) {
        // Usuário já existe, atualizar dados
        const { error: updateError } = await supabase
          .from("usuarios")
          .update({
            nome: userDetails.nome,
            email: userDetails.email,
          })
          .eq("id", userDetails.id);

        if (updateError) {
          console.error("Erro ao atualizar usuário existente:", updateError);
          toast({
            title: "Atenção",
            description:
              "Usuário existente, mas não foi possível migrar todos os dados.",
            variant: "destructive",
          });
          return { success: false, usuario: userDetails };
        }

        toast({
          title: "Sucesso",
          description: "Dados do usuário sincronizados com sucesso!",
        });
        return { success: true, usuario: userDetails };
      } else {
        // Usuário não existe, criar novo registro
        const { error: insertError } = await supabase
          .from("usuarios")
          .insert({
            id: userDetails.id,
            nome: userDetails.nome,
            email: userDetails.email,
            senha: "***autenticado-pelo-supabase***",
            ativo: true,
            perfil: "usuario",
            setores_atribuidos: []
          });

        if (insertError) {
          console.error("Erro ao criar novo usuário:", insertError);
          toast({
            title: "Erro",
            description:
              "Ocorreu um erro ao sincronizar os dados do usuário. " +
              insertError.message,
            variant: "destructive",
          });
          throw insertError;
        }

        toast({
          title: "Sucesso",
          description: "Dados do usuário sincronizados com sucesso!",
        });
        return { success: true, usuario: userDetails };
      }
    } catch (error) {
      console.error("Erro durante a migração/criação do usuário:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao sincronizar os dados do usuário.",
        variant: "destructive",
      });
      return { success: false, usuario: userDetails };
    }
  };

  // Execute a função de migração ou criação do usuário
  return await migrateOrCreateUsuario(userDetails);
};

// Exporte uma função wrapper que utiliza useMutation
export const useSyncAuth = () => {
  const { toast } = useToast();
  
  return useMutation({
    mutationFn: async (userDetails: UsuarioSupabase) => {
      return await syncAuth(userDetails);
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description:
          "Ocorreu um erro ao sincronizar os dados do usuário. " +
          error.message,
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Sucesso",
          description: "Dados do usuário sincronizados com sucesso!",
        });
      } else {
        toast({
          title: "Atenção",
          description:
            "Usuário existente, mas não foi possível migrar todos os dados.",
          variant: "destructive",
        });
      }
    }
  });
};
