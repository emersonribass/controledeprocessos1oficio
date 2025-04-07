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
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";

const AdminUsersPage = () => {
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [syncLoading, setSyncLoading] = useState(false);
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
    saveUsuario,
    forceSyncUsuario
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

  const handleSyncClick = async (usuario: UsuarioSupabase) => {
    await forceSyncUsuario(usuario);
  };

  const handleSyncAllUsers = async () => {
    setSyncLoading(true);
    let successCount = 0;
    let failCount = 0;
    
    try {
      toast.info("Iniciando sincronização de todos os usuários...");
      
      for (const usuario of usuarios) {
        try {
          const success = await forceSyncUsuario(usuario);
          if (success) {
            successCount++;
          } else {
            failCount++;
          }
          // Pequeno delay para não sobrecarregar
          await new Promise(resolve => setTimeout(resolve, 500));
        } catch (err) {
          console.error(`Erro ao sincronizar ${usuario.email}:`, err);
          failCount++;
        }
      }
      
      if (failCount === 0) {
        toast.success(`Todos os ${successCount} usuários foram sincronizados com sucesso!`);
      } else {
        toast.warning(`${successCount} usuários sincronizados com sucesso, ${failCount} falhas.`);
      }
    } catch (err) {
      console.error("Erro ao sincronizar usuários:", err);
      toast.error("Ocorreu um erro durante a sincronização dos usuários.");
    } finally {
      setSyncLoading(false);
    }
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

  const usuariosFiltrados = usuarios.filter((usuario) => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      usuario.nome.toLowerCase().includes(searchTermLower) ||
      usuario.email.toLowerCase().includes(searchTermLower) ||
      usuario.perfil.toLowerCase().includes(searchTermLower)
    );
  });

  return (
    <div className="space-y-6">
      <UsersPageHeader 
        onAddUsuario={handleAddUsuario} 
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
      />
      
      <div className="flex justify-end">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleSyncAllUsers}
          disabled={syncLoading || isLoading}
        >
          {syncLoading ? (
            <>
              <span className="h-4 w-4 mr-2 animate-spin rounded-full border-2 border-primary border-t-transparent"></span>
              Sincronizando...
            </>
          ) : (
            <>
              <RefreshCw className="h-4 w-4 mr-2" />
              Sincronizar todos os usuários
            </>
          )}
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
            usuarios={usuariosFiltrados}
            isLoading={isLoading}
            departments={departments}
            onToggleActive={handleToggleAtivo}
            onEdit={handleEditUsuario}
            onDelete={handleDeleteClick}
            onSync={handleSyncClick}
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
