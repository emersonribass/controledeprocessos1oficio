
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useProcesses } from "@/hooks/useProcesses";
import { UsersTable } from "@/components/Admin/UsersTable";
import { UserForm } from "@/components/Admin/UserForm";
import { DeleteUserDialog } from "@/components/Admin/DeleteUserDialog";

type UsuarioSupabase = {
  id: string;
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
  created_at: string;
  updated_at: string;
};

type FormUsuario = {
  nome: string;
  email: string;
  senha: string;
  ativo: boolean;
  setores_atribuidos: string[];
  perfil: 'administrador' | 'usuario';
};

const AdminUsersPage = () => {
  const [usuarios, setUsuarios] = useState<UsuarioSupabase[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [usuarioAtual, setUsuarioAtual] = useState<UsuarioSupabase | null>(null);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { toast } = useToast();
  const { departments } = useProcesses();

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
      toast({
        title: "Erro",
        description: "Não foi possível carregar a lista de usuários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleAddUsuario = () => {
    setUsuarioAtual(null);
    setOpenDialog(true);
  };

  const handleEditUsuario = (usuario: UsuarioSupabase) => {
    setUsuarioAtual(usuario);
    setOpenDialog(true);
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

      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao atualizar status do usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do usuário.",
        variant: "destructive",
      });
    }
  };

  const handleDeleteUsuario = (usuario: UsuarioSupabase) => {
    setUsuarioAtual(usuario);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!usuarioAtual) return;
    
    try {
      const { error } = await supabase
        .from("usuarios")
        .delete()
        .eq("id", usuarioAtual.id);

      if (error) {
        throw error;
      }

      toast({
        title: "Sucesso",
        description: "Usuário excluído com sucesso!",
      });

      fetchUsuarios();
      setOpenDeleteDialog(false);
    } catch (error) {
      console.error("Erro ao excluir usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível excluir o usuário.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = async (data: FormUsuario) => {
    try {
      if (usuarioAtual) {
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
          .eq("id", usuarioAtual.id);

        if (error) throw error;

        toast({
          title: "Sucesso",
          description: "Usuário atualizado com sucesso!",
        });
      } else {
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

      setOpenDialog(false);
      fetchUsuarios();
    } catch (error) {
      console.error("Erro ao salvar usuário:", error);
      toast({
        title: "Erro",
        description: "Não foi possível salvar o usuário.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Cadastro de Usuários</h2>
          <p className="text-muted-foreground">
            Gerencie os usuários do sistema e suas permissões.
          </p>
        </div>
        <Button onClick={handleAddUsuario}>
          <Plus className="mr-2 h-4 w-4" />
          Novo Usuário
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Usuários</CardTitle>
          <CardDescription>
            Lista de todos os usuários cadastrados no sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <UsersTable
            usuarios={usuarios}
            isLoading={isLoading}
            departments={departments}
            onToggleActive={handleToggleAtivo}
            onEdit={handleEditUsuario}
            onDelete={handleDeleteUsuario}
          />
        </CardContent>
      </Card>

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>
              {usuarioAtual ? "Editar Usuário" : "Adicionar Novo Usuário"}
            </DialogTitle>
            <DialogDescription>
              Preencha as informações do usuário e clique em salvar quando terminar.
            </DialogDescription>
          </DialogHeader>

          <UserForm
            usuarioAtual={usuarioAtual}
            departments={departments}
            onSave={onSubmit}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>

      <DeleteUserDialog
        open={openDeleteDialog}
        usuario={usuarioAtual}
        onOpenChange={setOpenDeleteDialog}
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default AdminUsersPage;
