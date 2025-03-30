
import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useProcesses } from "@/hooks/useProcesses";
import { UsersTable } from "@/components/Admin/UsersTable";
import { DeleteUserDialog } from "@/components/Admin/DeleteUserDialog";
import { UserFormDialog } from "@/components/Admin/UserFormDialog";
import { UsersPageHeader } from "@/components/Admin/UsersPageHeader";
import { useUsuarios } from "@/hooks/useUsuarios";
import { UsuarioSupabase } from "@/types/usuario";
import { useAuth } from "@/hooks/useAuth";

const AdminUsersPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const { departments } = useProcesses();
  const { user } = useAuth();
  
  const {
    usuarios,
    isLoading,
    usuarioAtual,
    setUsuarioAtual,
    fetchUsuarios,
    handleToggleAtivo,
    handleDeleteUsuario,
    saveUsuario
  } = useUsuarios();

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

  const handleDeleteClick = (usuario: UsuarioSupabase) => {
    setUsuarioAtual(usuario);
    setOpenDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!usuarioAtual) return;
    
    const success = await handleDeleteUsuario(usuarioAtual.id);
    if (success) {
      setOpenDeleteDialog(false);
    }
  };

  const onSubmit = async (data) => {
    const success = await saveUsuario(data, usuarioAtual?.id);
    if (success) {
      setOpenDialog(false);
    }
  };

  return (
    <div className="space-y-6">
      <UsersPageHeader onAddUsuario={handleAddUsuario} />

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
            onDelete={handleDeleteClick}
          />
        </CardContent>
      </Card>

      <UserFormDialog
        open={openDialog}
        onOpenChange={setOpenDialog}
        usuarioAtual={usuarioAtual}
        departments={departments}
        onSave={onSubmit}
      />

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
