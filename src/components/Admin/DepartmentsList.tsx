
import { Pencil, Trash2 } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Department } from "@/types";

interface DepartmentsListProps {
  departments: Department[];
  isLoading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
}

const DepartmentsList = ({ departments, isLoading, onEdit, onDelete }: DepartmentsListProps) => {
  console.log("DepartmentsList renderizado:", { departments, isLoading });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mb-4"></div>
        <p className="text-muted-foreground">Carregando setores...</p>
      </div>
    );
  }

  if (departments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <p className="text-muted-foreground">Nenhum setor encontrado. Clique em "Novo Setor" para adicionar.</p>
      </div>
    );
  }

  return (
    <Table className="w-full">
      <TableHeader>
        <TableRow className="h-10">
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Ordem</TableHead>
          <TableHead>Prazo (dias)</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.map((department) => (
          <TableRow key={department.id} className="h-8 py-1">
            <TableCell className="py-1">{department.id}</TableCell>
            <TableCell className="font-medium py-1">{department.name}</TableCell>
            <TableCell className="py-1">{department.order}</TableCell>
            <TableCell className="py-1">{department.timeLimit}</TableCell>
            <TableCell className="text-right py-1">
              <div className="flex justify-end space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onEdit(department)}
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => onDelete(department)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default DepartmentsList;
