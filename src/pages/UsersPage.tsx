
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/mockData";
import { User } from "@/types";
import { useProcesses } from "@/hooks/useProcesses";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const UsersPage = () => {
  const [users] = useState<User[]>(mockUsers);
  const { departments } = useProcesses();

  const getDepartmentName = (id: string) => {
    const department = departments.find((d) => d.id === id);
    return department ? department.name : "Desconhecido";
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Usuários</h2>
        <p className="text-muted-foreground">
          Gerencie os usuários do sistema e suas permissões.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Lista de Usuários</CardTitle>
            <Button>Adicionar Usuário</Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Data de Cadastro</TableHead>
                <TableHead>Departamentos</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.name}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    {/* Usando uma data padrão já que createdAt não existe no tipo User */}
                    {format(new Date(), "dd/MM/yyyy")}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {user.departments.map((depId) => (
                        <Badge key={depId} variant="outline">
                          {getDepartmentName(depId)}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm">
                      Editar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default UsersPage;
