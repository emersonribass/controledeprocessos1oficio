
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { UsuarioSupabase, FormUsuario } from "@/types/usuario";

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const { toast } = useToast();

  const fetchUsuarios = async () => {
    setIsLoading(true);
    try {
      console.log("Iniciando busca de usuários na tabela 'usuarios' do projeto controledeprocessos1oficio");
      console.log("URL do Supabase:", supabase.supabaseUrl);
      
      const { data, error, count } = await supabase
        .from("usuarios")
        .select("*", { count: 'exact' })
        .order("nome");

      if (error) {
        throw error;
      }

      console.log(`Encontrados ${count} usuários na tabela 'usuarios':`, data);
      
      // Se não houver usuários na tabela 'usuarios', vamos verificar 
      // se existem usuários no sistema de autenticação
      if (!data || data.length === 0) {
        console.log("Nenhum usuário encontrado na tabela 'usuarios'. Verificando auth.users...");
        
        try {
          // Verificar se há usuários autenticados que não estão na tabela 'usuarios'
          const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
          
          if (authError) {
            console.error("Erro ao buscar usuários autenticados:", authError);
          } else if (authUsers && authUsers.users && authUsers.users.length > 0) {
            console.log(`Encontrados ${authUsers.users.length} usuários no sistema de autenticação.`);
            console.log("É necessário sincronizar usuários do auth.users para a tabela 'usuarios'");
          } else {
            console.log("Nenhum usuário encontrado no sistema de autenticação.");
          }
        } catch (authError) {
          // Pode não ter permissão para acessar a listagem de usuários autenticados
          console.log("Não foi possível verificar usuários no sistema de autenticação:", authError);
        }
      }

      setUsuarios(data as UsuarioSupabase[] || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleAtivo = async (usuario: UsuarioSupabase) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ ativo: !usuario.ativo })
        .eq("id", usuario.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: `Usuário ${usuario.ativo ? 'desativado' : 'ativado'} com sucesso!`,
      });

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
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

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
        // Atualizar usuário existente
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

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
        // Criar novo usuário
        const { error } = await supabase.from("usuarios").insert({
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
