
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { supabaseService } from "@/services/supabase";

export function useUsuariosOperations(refetchUsuarios: () => Promise<void>) {
  const { toast } = useToast();

  const handleToggleAtivo = async (usuario: UsuarioSupabase) => {
    try {
      const { error } = await supabaseService.toggleUsuarioAtivo(usuario.id, usuario.ativo);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });

      await refetchUsuarios();
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUsuario = async (id: string) => {
    try {
      const { error } = await supabaseService.deleteUsuario(id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      await refetchUsuarios();
      return true;
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

  const saveUsuario = async (data: FormUsuario, usuarioId?: string) => {
    try {
      if (usuarioId) {
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

        const { error } = await supabaseService.updateUsuario(usuarioId, updateData);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        const { error } = await supabaseService.createUsuario({
          nome: data.nome,
          email: data.email,
          senha: data.senha,
          ativo: data.ativo,
          setores_atribuidos: data.setores_atribuidos,
          perfil: data.perfil,
        });

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário criado com sucesso!",
        });
      }

      await refetchUsuarios();
      return true;
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    handleToggleAtivo,
    handleDeleteUsuario,
    saveUsuario
  };
}
