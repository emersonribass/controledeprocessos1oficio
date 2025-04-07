
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Pencil, Trash2, ToggleLeft, ToggleRight, RefreshCw } from "lucide-react";
import { UsuarioSupabase } from "@/types/usuario";
import { Department } from "@/types";

type UsersTableProps = {
  usuarios: UsuarioSupabase[];
  isLoading: boolean;
  departments: Department[];
  onToggleActive: (usuario: UsuarioSupabase) => void;
  onEdit: (usuario: UsuarioSupabase) => void;
  onDelete: (usuario: UsuarioSupabase) => void;
  onSync?: (usuario: UsuarioSupabase) => void;
};

export function UsersTable({
  usuarios,
  isLoading,
  departments,
  onToggleActive,
  onEdit,
  onDelete,
  onSync
}: UsersTableProps) {
  const [syncingUser, setSyncingUser] = useState<string | null>(null);

  const handleSyncClick = async (usuario: UsuarioSupabase) => {
    if (onSync) {
      setSyncingUser(usuario.id);
      await onSync(usuario);
      setSyncingUser(null);
    }
  };

  const getDepartmentNames = (departmentIds: string[]) => {
    return departmentIds
      .map((id) => {
        const dept = departments.find((d) => d.id.toString() === id);
        return dept ? dept.name : id;
      })
      .join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin h-8 w-8 border-t-2 border-b-2 border-primary rounded-full"></div>
      </div>
    );
  }

  return (
    <div className="rounded-md border overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Setores Atribuídos</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map((usuario) => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  <Badge
                    variant={usuario.perfil === "administrador" ? "destructive" : "outline"}
                  >
                    {usuario.perfil === "administrador" ? "Administrador" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell>
                  {usuario.setores_atribuidos?.length > 0
                    ? getDepartmentNames(usuario.setores_atribuidos)
                    : "Nenhum"}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={usuario.ativo ? "default" : "secondary"}
                    className="cursor-pointer"
                    onClick={() => onToggleActive(usuario)}
                  >
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex items-center justify-end space-x-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onEdit(usuario)}
                      title="Editar usuário"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleActive(usuario)}
                      title={usuario.ativo ? "Desativar" : "Ativar"}
                    >
                      {usuario.ativo ? (
                        <ToggleRight className="h-4 w-4" />
                      ) : (
                        <ToggleLeft className="h-4 w-4" />
                      )}
                    </Button>
                    {onSync && (
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleSyncClick(usuario)}
                        disabled={syncingUser === usuario.id}
                        title="Sincronizar com autenticação"
                      >
                        {syncingUser === usuario.id ? (
                          <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <RefreshCw className="h-4 w-4" />
                        )}
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onDelete(usuario)}
                      title="Excluir usuário"
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
