import { Pencil, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Department } from "@/types";
interface DepartmentsListProps {
  departments: Department[];
  isLoading: boolean;
  onEdit: (department: Department) => void;
  onDelete: (department: Department) => void;
  onMoveUp: (department: Department) => void;
  onMoveDown: (department: Department) => void;
}
const DepartmentsList = ({
  departments,
  isLoading,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown
}: DepartmentsListProps) => {
  if (isLoading) {
    return <div className="flex justify-center p-4">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>;
  }
  return <Table className="w-full">
      <TableHeader>
        <TableRow className="h-10">
          <TableHead>ID</TableHead>
          <TableHead>Nome</TableHead>
          <TableHead>Prazo (dias)</TableHead>
          <TableHead className="text-right">Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {departments.length === 0 ? <TableRow>
            <TableCell colSpan={4} className="text-center py-6">
              Nenhum setor encontrado.
            </TableCell>
          </TableRow> : departments.map(department => <TableRow key={department.id} className="h-8 py-1">
              <TableCell className="py-1">{department.id}</TableCell>
              <TableCell className="font-medium py-1">{department.name}</TableCell>
              <TableCell className="py-1">{department.timeLimit}</TableCell>
              <TableCell className="text-right py-1">
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" size="icon" onClick={() => onMoveUp(department)} disabled={departments[0].id === department.id} title="Mover para cima" className="hover:text-blue-600 hover:border-blue-200 bg-sky-400 hover:bg-sky-300">
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onMoveDown(department)} disabled={departments[departments.length - 1].id === department.id} title="Mover para baixo" className="hover:text-blue-600 hover:border-blue-200 bg-sky-400 hover:bg-sky-300">
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onEdit(department)} title="Editar" className="hover:text-amber-600 hover:border-amber-200 bg-amber-400 hover:bg-amber-300">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={() => onDelete(department)} title="Excluir" className="hover:text-red-600 hover:border-red-200 bg-red-400 hover:bg-red-300">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>)}
      </TableBody>
    </Table>;
};
export default DepartmentsList;