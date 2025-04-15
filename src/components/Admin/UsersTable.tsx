
import { UserCheck, UserX, Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Department } from "@/types";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { formatBrasiliaTime } from "@/lib/timezone";

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

type UsersTableProps = {
  usuarios: UsuarioSupabase[];
  isLoading: boolean;
  departments: Department[];
  onToggleActive: (usuario: UsuarioSupabase) => void;
  onEdit: (usuario: UsuarioSupabase) => void;
  onDelete: (usuario: UsuarioSupabase) => void;
};

export function UsersTable({
  usuarios,
  isLoading,
  departments,
  onToggleActive,
  onEdit,
  onDelete
}: UsersTableProps) {
  const getDepartmentName = (id: string) => {
    const department = departments.find(d => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  const getSetoresNames = (setorIds: string[]) => {
    return setorIds.map(id => getDepartmentName(id)).join(", ");
  };

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Data de Cadastro</TableHead>
            <TableHead>Setores</TableHead>
            <TableHead>Perfil</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {usuarios.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} className="text-center py-6">
                Nenhum usuário encontrado.
              </TableCell>
            </TableRow>
          ) : (
            usuarios.map(usuario => (
              <TableRow key={usuario.id}>
                <TableCell className="font-medium">{usuario.nome}</TableCell>
                <TableCell>{usuario.email}</TableCell>
                <TableCell>
                  {formatBrasiliaTime(new Date(usuario.created_at), "dd/MM/yyyy")}
                </TableCell>
                <TableCell>
                  <Tooltip>
                    <TooltipTrigger>
                      <Badge variant="outline" className="cursor-help">
                        {usuario.setores_atribuidos.length}
                      </Badge>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{getSetoresNames(usuario.setores_atribuidos) || "Nenhum setor atribuído"}</p>
                    </TooltipContent>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.perfil === "administrador" ? "default" : "secondary"}>
                    {usuario.perfil === "administrador" ? "Administrador" : "Usuário"}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={usuario.ativo ? "default" : "destructive"}>
                    {usuario.ativo ? "Ativo" : "Inativo"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end space-x-2">
                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(usuario)} title={usuario.ativo ? "Desativar usuário" : "Ativar usuário"} className="text-white bg-green-600 hover:bg-green-500">
                      {usuario.ativo ? <UserX className="h-4 w-4" /> : <UserCheck className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onEdit(usuario)} title="Editar usuário" className="text-white bg-amber-400 hover:bg-amber-300">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(usuario)} title="Excluir usuário" className="text-white bg-red-400 hover:bg-red-300">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </TooltipProvider>
  );
}
