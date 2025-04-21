
import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";
import { supabaseService } from "@/services/supabase";

// Armazenamento de requisições em andamento para evitar duplicação
const pendingRequests: Record<string, Promise<any>> = {};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const { toast } = useToast();

  const fetchUsuarios = useCallback(async () => {
    // Se já existe uma requisição em andamento, reutilize-a
    if (pendingRequests['fetchUsuarios']) {
      try {
        const result = await pendingRequests['fetchUsuarios'];
        setUsuarios(result.data as UsuarioSupabase[] || []);
        return result;
      } catch (error) {
        console.error("Erro ao buscar usuários (requisição existente):", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar a lista de usuários.",
          variant: "destructive",
        });
        return { data: [], error };
      }
    }

    setIsLoading(true);
    
    // Cria uma nova promessa e a guarda para possível reuso
    pendingRequests['fetchUsuarios'] = (async () => {
      try {
        const result = await supabaseService.fetchUsuarios();
        return result;
      } catch (error) {
        console.error("Erro ao buscar usuários:", error);
        return { data: [], error };
      } finally {
        // Remove a requisição pendente após conclusão
        delete pendingRequests['fetchUsuarios'];
      }
    })();

    try {
      const result = await pendingRequests['fetchUsuarios'];
      
      if (result.error) {
        throw result.error;
      }

      setUsuarios(result.data as UsuarioSupabase[] || []);
      return result;
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
      return { data: [], error };
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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

      // Atualizar estado local antes de buscar novamente
      setUsuarios(prev => prev.map(u => 
        u.id === usuario.id ? { ...u, ativo: !u.ativo } : u
      ));
      
      await fetchUsuarios();
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

      // Atualizar estado local antes de buscar novamente
      setUsuarios(prev => prev.filter(u => u.id !== id));
      
      await fetchUsuarios();
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
        
        // Atualizar estado local antes de buscar novamente
        setUsuarios(prev => prev.map(u => 
          u.id === usuarioId ? { ...u, ...updateData } : u
        ));

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

      await fetchUsuarios();
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
    usuarios,
    isLoading,
    usuarioAtual,
    setUsuarioAtual,
    fetchUsuarios,
    handleToggleAtivo,
    handleDeleteUsuario,
    saveUsuario
  };
}
