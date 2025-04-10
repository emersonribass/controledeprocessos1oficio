
import { FormUsuario, UsuarioSupabase } from "@/types/usuario";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { syncAuthWithUsuarios } from "@/hooks/auth/utils";

export function useUsuariosOperations() {
  const handleToggleAtivo = async (usuario: UsuarioSupabase) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id);

      if (error) {
        throw error;
      }

      toast.success(`Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`);
      return true;
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast.error("Não foi possível atualizar o status do usuário.");
      return false;
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast.success("Usuário excluído com sucesso!");
      return true;
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast.error("Não foi possível excluir o usuário.");
      return false;
    }
  };

  const saveUsuario = async (data: FormUsuario, usuarioId?: string) => {
    try {
      // Primeiro, vamos verificar se é uma atualização ou criação
      if (usuarioId) {
        // ===== ATUALIZAÇÃO DE USUÁRIO EXISTENTE =====
        const updateData: Partial<UsuarioSupabase> = {
          nome: data.nome,
          email: data.email,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        };

        if (data.senha) {
          updateData.senha = data.senha;
        }

        const { error } = await supabase
          .from("usuarios")
          .update(updateData)
          .eq("id", usuarioId);

        if (error) throw error;

        // Sincronizar com auth.users se a senha foi alterada
        if (data.senha) {
          const syncResult = await syncAuthWithUsuarios(data.email, data.senha);
          if (!syncResult) {
            console.warn("Aviso: Falha na sincronização do usuário com autenticação");
          }
        }

        toast.success("Usuário atualizado com sucesso!");
      } else {
        // ===== CRIAÇÃO DE NOVO USUÁRIO =====
        try {
          console.log("Iniciando criação de usuário na autenticação...");
          
          // 1. Primeiro criamos o usuário no sistema de autenticação
          const authResult = await syncAuthWithUsuarios(data.email, data.senha);
          
          if (!authResult) {
            toast.error("Falha ao criar usuário no sistema de autenticação.");
            return false;
          }
          
          console.log("Usuário criado na autenticação, obtendo ID:", authResult);
          
          // 2. Buscar o ID gerado pelo auth
          let userId: string | null = null;
          
          if (typeof authResult === 'string') {
            userId = authResult;
          } else {
            // Tentar buscar o usuário pelo email diretamente da tabela usuarios
            const { data: userData, error: userError } = await supabase
              .from('usuarios')
              .select('id')
              .eq('email', data.email)
              .maybeSingle();
              
            if (userError || !userData) {
              console.error("Erro ao buscar ID do usuário pelo email:", userError);
              throw new Error("Erro ao obter ID do usuário criado");
            }
            
            userId = userData.id;
          }
          
          console.log("ID do usuário para inserção na tabela usuarios:", userId);
          
          if (!userId) {
            throw new Error("Não foi possível obter o ID do usuário para sincronização");
          }
          
          // 4. Inserir na tabela de usuarios com o ID obtido do auth
          const { error: insertError } = await supabase.from("usuarios").insert({
            id: userId,
            nome: data.nome,
            email: data.email,
            senha: data.senha,
            ativo: data.ativo,
            setores_atribuidos: data.setores_atribuidos,
            perfil: data.perfil,
            auth_sincronizado: true
          });
          
          if (insertError) {
            throw insertError;
          }
          
          toast.success("Usuário criado com sucesso!");
        } catch (error) {
          console.error("Erro detalhado ao criar usuário:", error);
          toast.error("Não foi possível criar o usuário. Verifique o console para mais detalhes.");
          return false;
        }
      }

      return true;
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast.error("Não foi possível salvar o usuário.");
      return false;
    }
  };

  return {
    handleToggleAtivo,
    handleDeleteUsuario,
    saveUsuario
  };
}
